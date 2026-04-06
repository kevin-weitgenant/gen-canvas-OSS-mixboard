"""Server-Sent Events (SSE) connection manager for real-time updates."""

import asyncio
import json
from typing import Dict

from fastapi import HTTPException


class SSEManager:
    """Manages Server-Sent Events (SSE) connections for real-time task updates."""
    def __init__(self):
        # Map taskId -> Queue
        self.connections: Dict[str, asyncio.Queue] = {}
        # Map taskId -> client_id for tracking
        self.clients: Dict[str, str] = {}

    async def create_connection(self, task_id: str) -> None:
        """Create a new SSE connection queue for a task."""
        if task_id in self.connections:
            raise ValueError(f"Connection for {task_id} already exists")
        self.connections[task_id] = asyncio.Queue()

    async def send_event(self, task_id: str, data: dict) -> bool:
        """Send an event to a specific task's SSE connection."""
        if task_id not in self.connections:
            print(f"[SSE] Task not found: {task_id}")
            return False
        print(f"[SSE] Sending event for task {task_id}: {data.get('state')}")
        await self.connections[task_id].put(data)
        return True

    async def event_stream(self, task_id: str):
        """Generator for SSE events."""
        if task_id not in self.connections:
            # Send error as SSE event instead of raising HTTPException
            # because we can't change status code after streaming starts
            yield {"data": json.dumps({"state": "error", "message": "Task not found or expired"})}
            return

        print(f"[SSE] Client connected for task: {task_id}")
        try:
            while True:
                data = await self.connections[task_id].get()
                print(f"[SSE] Yielding event for task {task_id}: {data.get('state')}")
                yield {"data": json.dumps(data)}

                # Close connection on terminal states
                if data.get("state") in ["success", "fail"]:
                    # Send one final event then break
                    print(f"[SSE] Terminal state reached for task {task_id}: {data.get('state')}")
                    break
        finally:
            # Cleanup
            print(f"[SSE] Cleaning up connection for task: {task_id}")
            self.connections.pop(task_id, None)
            self.clients.pop(task_id, None)

    def get_connection_count(self) -> int:
        """Return the number of active SSE connections."""
        return len(self.connections)


sse_manager = SSEManager()
