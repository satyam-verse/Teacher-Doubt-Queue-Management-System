from backend.src.models.doubt import Doubt
from backend.src.extensions import db

class QueueService:
    @staticmethod
    def get_queue_position(doubt: Doubt) -> int:
        """
        Calculate 1-based FIFO queue position for a given doubt among active QUEUED doubts.
        """
        if doubt.status != 'QUEUED':
            return 0
        
        query = Doubt.query.filter(
            Doubt.status == 'QUEUED',
            Doubt.created_at <= doubt.created_at
        )
        if doubt.session_id:
            query = query.filter(Doubt.session_id == doubt.session_id)
        
        return query.count()

    @staticmethod
    def get_estimated_wait_time(position: int) -> int:
        """Estimate wait time in minutes (approx 3.5 minutes per queued doubt)."""
        if position <= 0:
            return 0
        return max(1, int(position * 3.5))

    @staticmethod
    def get_session_stats(session_id: int = None) -> dict:
        """Get summary metrics for dashboard cards."""
        base_query = Doubt.query
        if session_id:
            base_query = base_query.filter(Doubt.session_id == session_id)
        
        queued = base_query.filter(Doubt.status == 'QUEUED').count()
        in_progress = base_query.filter(Doubt.status == 'IN_PROGRESS').count()
        resolved = base_query.filter(Doubt.status == 'RESOLVED').count()
        
        return {
            'queued': queued,
            'in_progress': in_progress,
            'resolved': resolved,
            'total': queued + in_progress + resolved
        }
