"""Unit test to verify Gemini SDK call structuring, role alternation, and universal system prompts."""
import os
import sys
sys.path.insert(0, os.path.abspath('.'))

from unittest.mock import MagicMock, patch
from backend.src import create_app
from backend.src.services.ai_service import AIService

def test_gemini_generation_call_structure():
    app = create_app('testing')
    app.config['GEMINI_API_KEY'] = 'test-mock-key-12345'
    app.config['GEMINI_MODEL'] = 'gemini-2.5-flash'

    with app.app_context():
        mock_response = MagicMock()
        mock_response.text = "Photosynthesis equation: 6CO2 + 6H2O -> C6H12O6 + 6O2"
        mock_client = MagicMock()
        mock_client.models.generate_content.return_value = mock_response

        with patch.object(AIService, '_get_client', return_value=mock_client):
            history = [
                {'sender_type': 'user', 'content': 'Explain cloud computing.'},
                {'sender_type': 'assistant', 'content': 'Cloud computing delivers on-demand computing services.'}
            ]
            ans = AIService.generate_chat_response(
                history=history,
                user_message="What are its types?",
                explanation_level="intermediate"
            )

            assert "Photosynthesis" in ans
            call_kwargs = mock_client.models.generate_content.call_args[1]

            # Verify model
            assert call_kwargs['model'] == 'gemini-2.5-flash'

            # Verify contents
            contents = call_kwargs['contents']
            assert len(contents) == 3
            assert contents[0].role == 'user'
            assert contents[0].parts[0].text == 'Explain cloud computing.'
            assert contents[1].role == 'model'
            assert contents[1].parts[0].text == 'Cloud computing delivers on-demand computing services.'
            assert contents[2].role == 'user'
            assert contents[2].parts[0].text == 'What are its types?'

            # Verify system instruction contains universal directives
            sys_inst = call_kwargs['config'].system_instruction
            assert "You have NO subject, domain, or language restrictions" in sys_inst
            assert "Computer Science" in sys_inst
            assert "Mathematics" in sys_inst
            assert "Physics, Chemistry, Biology" in sys_inst
            assert "History, Geography, Philosophy" in sys_inst
            assert "LaTeX notation" in sys_inst

            print("PASSED: Gemini SDK call structure, role alternation, and universal prompt verified successfully!")

if __name__ == '__main__':
    test_gemini_generation_call_structure()
