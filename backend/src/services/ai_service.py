import json
import logging
import base64
import os
import time
import urllib.request
from typing import List, Dict, Optional, Tuple
from flask import current_app

logger = logging.getLogger(__name__)

class AIService:
    _cached_client = None
    _cached_key = None

    @classmethod
    def _get_client(cls, api_key: str):
        """Returns a cached genai.Client instance for the provided API key."""
        if cls._cached_client is not None and cls._cached_key == api_key:
            return cls._cached_client
        from google import genai
        cls._cached_client = genai.Client(api_key=api_key)
        cls._cached_key = api_key
        return cls._cached_client

    @classmethod
    def check_gemini_health(cls) -> dict:
        """
        Inspects backend configuration and verifies connection to Google Gemini.
        Returns connection status, active model, and descriptive status.
        """
        api_key = current_app.config.get('GEMINI_API_KEY')
        model_name = current_app.config.get('GEMINI_MODEL', 'gemini-2.5-flash')

        if not api_key:
            return {
                'status': 'unconfigured',
                'configured': False,
                'model': model_name,
                'message': 'Google Gemini API key is not configured in backend/.env'
            }

        try:
            client = cls._get_client(api_key)
            # Lightweight verification ping
            response = client.models.generate_content(
                model=model_name,
                contents="Ping",
                config={"max_output_tokens": 5}
            )
            return {
                'status': 'connected',
                'configured': True,
                'model': model_name,
                'message': 'Google Gemini API connection active and verified'
            }
        except Exception as e:
            err_str = str(e)
            status = 'error'
            if '403' in err_str or 'API_KEY_INVALID' in err_str or 'PERMISSION_DENIED' in err_str:
                status = 'invalid_key'
                msg = 'Google Gemini API key was rejected as invalid or unauthorized'
            elif '429' in err_str or 'QUOTA_EXCEEDED' in err_str or 'RESOURCE_EXHAUSTED' in err_str:
                status = 'quota_exceeded'
                msg = 'Gemini API rate limit or quota exceeded'
            elif 'timeout' in err_str.lower() or 'timed out' in err_str.lower():
                status = 'timeout'
                msg = 'Connection to Gemini API timed out'
            else:
                msg = f'Gemini API connection issue: {err_str[:120]}'

            logger.warning(f"Gemini health check status: {status} ({msg})")
            return {
                'status': status,
                'configured': True,
                'model': model_name,
                'message': msg
            }

    @staticmethod
    def _get_universal_system_instruction(explanation_level: str = 'intermediate') -> str:
        """
        Universal academic and technical system prompt.
        Has NO subject, category, or language restrictions.
        """
        level_guides = {
            'beginner': """
- Target Audience: Absolute beginners, introductory students, and learners encountering the topic for the first time.
- Tone: Welcoming, patient, encouraging, and intuitive.
- Approach:
  * Use vivid real-world analogies and intuitive comparisons.
  * Break reasoning into clear, sequential, step-by-step sections.
  * Define all terminology in plain language before using it; avoid unexplained jargon.
  * When writing code or math, explain each line or term thoroughly with explanatory commentary.
""",
            'intermediate': """
- Target Audience: University undergraduates, junior-to-mid practitioners, and serious academic students.
- Tone: Professional, structured, articulate, and technically precise.
- Approach:
  * Provide thorough conceptual explanations balancing theoretical foundations with practical application.
  * Highlight industry and academic standards, edge cases, best practices, and common misconceptions.
  * When analyzing code or systems, discuss time and space complexity (Big-O), design trade-offs, and practical conventions.
  * When solving mathematical or scientific problems, present complete derivations with step-by-step justification.
""",
            'advanced': """
- Target Audience: Senior software architects, competitive programmers, graduate researchers, and subject-matter experts.
- Tone: Rigorous, dense, analytically uncompromising, and concise.
- Approach:
  * Delve into internal mechanics, memory/cache semantics, hardware implications, and distributed system trade-offs.
  * For mathematical and scientific questions, provide formal proofs, invariants, asymptotic limits, and state-of-the-art research contexts.
  * For code, provide highly optimized implementations, benchmark considerations, and deep architectural rationale.
"""
        }

        guide = level_guides.get(explanation_level.lower(), level_guides['intermediate'])

        return f"""You are DoubtX AI, an elite, universal academic and technical assistant with comprehensive knowledge across all disciplines.

You have NO subject, domain, or language restrictions. You assist learners across:
- Computer Science, Software Engineering, Cloud Architecture, DevOps, and Cybersecurity.
- Mathematics, Calculus, Linear Algebra, Probability, Statistics, and Discrete Math.
- Physics, Chemistry, Biology, Genetics, Environmental Science, and Agriculture.
- Business, Management, Economics, Finance, and Accounting.
- History, Geography, Philosophy, Law, Literature, and Linguistics.
- Engineering, Emerging Technologies, Interdisciplinary Research, and unfamiliar novel concepts.

Instructions for Explanation Level [{explanation_level.upper()}]:
{guide}

Universal Response Architecture & Formatting Guidelines:
1. Direct, Engaging Answer: Begin with a direct, comprehensive explanation addressing the user's exact intent.
2. Structure & Readability: Use clear Markdown headings (##, ###), bullet points, and ordered lists to organize ideas logically.
3. Code & Technical Snippets: Always format code in standard Markdown fences with language identifiers (e.g. ```python, ```cpp, ```java, ```sql, ```bash). Include inline comments on crucial lines.
4. Mathematics & Formulas: Format all mathematical formulas using LaTeX notation ($...$ for inline formulas, and $$...$$ on its own line for display equations).
5. Comparisons & Tables: Use clean Markdown tables when comparing technologies, methods, pros/cons, or historical/scientific data.
6. Multimodal Synthesis: When an image, diagram, error screenshot, or PDF document is provided, thoroughly examine the visual/document content, extract text/equations, and synthesize an answer grounded directly in the attachment.
7. Pedagogical Value: Point out common pitfalls, best practices, and practical real-world applications where appropriate.
"""

    @classmethod
    def _execute_with_retry(cls, call_fn, max_retries: int = 3, initial_delay: float = 1.0):
        """Executes a Gemini call with exponential backoff for transient errors."""
        delay = initial_delay
        last_error = None
        for attempt in range(1, max_retries + 1):
            try:
                return call_fn()
            except Exception as e:
                last_error = e
                err_str = str(e).lower()
                is_transient = any(t in err_str for t in ['503', '500', 'timeout', 'timed out', 'connection reset', 'econnreset', 'temporary'])
                if is_transient and attempt < max_retries:
                    logger.warning(f"Transient error on attempt {attempt}/{max_retries}: {e}. Retrying in {delay:.1f}s...")
                    time.sleep(delay)
                    delay *= 2.0
                    continue
                break
        raise last_error

    @classmethod
    def generate_chat_response(
        cls,
        history: List[Dict[str, str]],
        user_message: str,
        explanation_level: str = 'intermediate',
        attachment_url: Optional[str] = None,
        attachment_type: Optional[str] = None
    ) -> str:
        """
        Universal multi-turn conversational response with adaptive difficulty level,
        multimodal image & PDF document synthesis, and robust error handling.
        """
        api_key = current_app.config.get('GEMINI_API_KEY')
        model_name = current_app.config.get('GEMINI_MODEL', 'gemini-2.5-flash')

        # Clear error if API key is not configured
        if not api_key:
            return (
                "### ⚠️ Google Gemini API Key Not Configured\n\n"
                "DoubtX AI requires a valid Google Gemini API key to deliver universal multi-domain academic reasoning.\n\n"
                "**Quick Configuration Steps:**\n"
                "1. Open `backend/.env` (or project root `.env`).\n"
                "2. Add your key: `GEMINI_API_KEY=your_actual_gemini_api_key`.\n"
                "3. Restart the backend server (`python app.py`).\n\n"
                "*Get a free API key at [Google AI Studio](https://aistudio.google.com/app/apikey).*"
            )

        system_instruction = cls._get_universal_system_instruction(explanation_level)

        try:
            from google import genai
            from google.genai import types

            client = cls._get_client(api_key)

            # Assemble conversation contents ensuring strictly alternating roles
            contents = []
            
            # Context windowing: keep up to 12 most recent turns
            relevant_history = history[-12:] if len(history) > 12 else history

            last_role = None
            for msg in relevant_history:
                msg_content = (msg.get('content') or '').strip()
                if not msg_content:
                    continue

                role = "user" if msg.get('sender_type') == 'user' else "model"
                # Skip duplicate adjacent roles to prevent SDK schema errors
                if role == last_role and contents:
                    contents[-1].parts.append(types.Part.from_text(text=msg_content))
                else:
                    contents.append(
                        types.Content(
                            role=role,
                            parts=[types.Part.from_text(text=msg_content)]
                        )
                    )
                    last_role = role

            # Assemble current turn parts
            current_parts = []

            # Process attachment (image or PDF document)
            if attachment_url:
                att_bytes, detected_mime = cls._load_attachment_bytes(attachment_url, attachment_type)
                if att_bytes and detected_mime:
                    current_parts.append(
                        types.Part.from_bytes(
                            data=att_bytes,
                            mime_type=detected_mime
                        )
                    )
                    if detected_mime.startswith('image/'):
                        current_parts.append(
                            types.Part.from_text(
                                text="[Attachment: Image/Screenshot provided above. Please analyze the visual content, extract any visible text, code, equations, or diagrams, and answer the question below.]\n"
                            )
                        )
                    elif detected_mime == 'application/pdf':
                        current_parts.append(
                            types.Part.from_text(
                                text="[Attachment: PDF document provided above. Please review the document contents and answer the inquiry below based on its material.]\n"
                            )
                        )

            # Append user message text
            current_parts.append(types.Part.from_text(text=user_message or "Please analyze the attached document/image."))

            # Ensure current turn is user role
            if last_role == "user" and contents:
                contents[-1].parts.extend(current_parts)
            else:
                contents.append(types.Content(role="user", parts=current_parts))

            # Call Gemini with retry wrapper
            def _call_gemini():
                return client.models.generate_content(
                    model=model_name,
                    contents=contents,
                    config=types.GenerateContentConfig(
                        system_instruction=system_instruction,
                        temperature=0.5,
                    )
                )

            response = cls._execute_with_retry(_call_gemini, max_retries=3)

            if response and response.text:
                return response.text.strip()
            return "DoubtX AI evaluated your query but received an empty response. Please try rephrasing your question."

        except Exception as e:
            err_str = str(e)
            logger.error(f"Gemini generation error: {err_str}")

            if "403" in err_str or "API_KEY_INVALID" in err_str or "PERMISSION_DENIED" in err_str:
                return (
                    "### ⚠️ Invalid Google Gemini API Key\n\n"
                    "The `GEMINI_API_KEY` provided in `backend/.env` was rejected by Google AI Studio.\n"
                    "Please verify your API key at [Google AI Studio](https://aistudio.google.com/app/apikey) and update `backend/.env`."
                )
            elif "429" in err_str or "QUOTA_EXCEEDED" in err_str or "RESOURCE_EXHAUSTED" in err_str:
                return (
                    "### ⏳ Gemini API Quota or Rate Limit Reached\n\n"
                    "Google Gemini API rate limits or quota thresholds were reached. "
                    "Please wait a moment and click **Regenerate**, or check your quota in Google AI Studio."
                )
            elif "timeout" in err_str.lower() or "timed out" in err_str.lower():
                return (
                    "### 🌐 Network Timeout\n\n"
                    "The connection to Google Gemini API timed out after 3 retries. "
                    "Please check your internet connection and try again."
                )
            else:
                return (
                    f"### ⚠️ Gemini Service Notification\n\n"
                    f"Unable to process question via Gemini API: `{err_str[:250]}`.\n\n"
                    "Please verify your `backend/.env` configuration and retry."
                )

    @classmethod
    def analyze_doubt(cls, doubt_text: str) -> dict:
        """Analyze a student's queue doubt for categorization and priority."""
        api_key = current_app.config.get('GEMINI_API_KEY')
        if not api_key:
            return cls._fallback_heuristic_analysis(doubt_text)

        try:
            client = cls._get_client(api_key)
            model_name = current_app.config.get('GEMINI_MODEL', 'gemini-2.5-flash')

            prompt = f"""
Analyze this student classroom doubt:
"{doubt_text}"

Return a valid JSON object strictly matching this schema:
{{
  "category": "short category or subject name (e.g. Python, Calculus, Physics, SQL, React, Organic Chemistry, Economics, or General)",
  "priority": "LOW, MEDIUM, HIGH, or URGENT",
  "ai_hint": "A concise 1-2 sentence guiding clue to help the student think before the instructor arrives.",
  "ai_suggested_solution": "A concise 2-3 bullet point technical solution and code recommendation for the instructor to quickly review."
}}
Do NOT wrap in backticks or markdown; output only raw JSON.
"""
            def _call_analysis():
                return client.models.generate_content(
                    model=model_name,
                    contents=prompt
                )

            response = cls._execute_with_retry(_call_analysis, max_retries=2)
            response_text = response.text.strip()
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.startswith("```"):
                response_text = response_text[3:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]

            parsed = json.loads(response_text.strip())
            return {
                "category": parsed.get("category", "General"),
                "priority": parsed.get("priority", "MEDIUM").upper(),
                "ai_hint": parsed.get("ai_hint", "Review the problem steps and verify your assumptions."),
                "ai_suggested_solution": parsed.get("ai_suggested_solution", "Review student logic and verify variable states.")
            }
        except Exception as e:
            logger.warning(f"Queue doubt analysis via Gemini failed: {e}. Using heuristic fallback.")
            return cls._fallback_heuristic_analysis(doubt_text)

    @staticmethod
    def _fallback_heuristic_analysis(doubt_text: str) -> dict:
        """Heuristic fallback for queue doubt analysis when Gemini API is unconfigured."""
        text_lower = doubt_text.lower()
        if any(w in text_lower for w in ['sql', 'query', 'mysql', 'database', 'table', 'select', 'join']):
            category = "Database / SQL"
        elif any(w in text_lower for w in ['react', 'hook', 'state', 'component', 'props', 'jsx', 'vite']):
            category = "Frontend / Web"
        elif any(w in text_lower for w in ['python', 'def ', 'flask', 'indentation', 'syntaxerror', 'nameerror']):
            category = "Python / Backend"
        elif any(w in text_lower for w in ['integral', 'derivative', 'matrix', 'equation', 'algebra', 'calculus']):
            category = "Mathematics"
        elif any(w in text_lower for w in ['null', 'undefined', 'exception', 'error', 'bug', 'crash', 'traceback']):
            category = "Debugging & Errors"
        else:
            category = "General Academic"

        priority = "HIGH" if any(w in text_lower for w in ['urgent', 'exam', 'blocker', 'deadline', 'crash']) else "MEDIUM"

        return {
            "category": category,
            "priority": priority,
            "ai_hint": "Check the exact line of failure and review variables, units, and syntax. Ensure all steps align with standard definitions.",
            "ai_suggested_solution": "Inspect recent error stacktrace or working equations. Verify variable scopes and conceptual assumptions."
        }

    @classmethod
    def _load_attachment_bytes(cls, attachment_url: str, attachment_type: Optional[str] = None) -> Tuple[Optional[bytes], Optional[str]]:
        """
        Loads attachment bytes from base64 data URI, local path, or remote URL.
        Supports images and PDF documents.
        """
        try:
            # Base64 data URL
            if attachment_url.startswith('data:'):
                header, encoded = attachment_url.split(',', 1)
                mime = header.split(';')[0].replace('data:', '').strip()
                return base64.b64decode(encoded), mime

            # Local filesystem path
            if os.path.exists(attachment_url):
                with open(attachment_url, 'rb') as f:
                    data = f.read()
                mime = attachment_type or ('application/pdf' if attachment_url.lower().endswith('.pdf') else 'image/png')
                return data, mime

            # HTTP / S3 URL
            if attachment_url.startswith(('http://', 'https://')):
                req = urllib.request.Request(
                    attachment_url,
                    headers={'User-Agent': 'DoubtX-AI-Universal/1.0'}
                )
                with urllib.request.urlopen(req, timeout=10) as resp:
                    data = resp.read()
                    mime = attachment_type or resp.headers.get_content_type()
                    return data, mime

            return None, None
        except Exception as e:
            logger.warning(f"Could not load attachment bytes from {attachment_url}: {e}")
            return None, None
