import { useEffect } from 'react';
import { useSessionStore } from '../stores/sessionStore';

// Ultra-simple sharing that actually works
export const useSimpleShare = () => {
  const { session, updateFile } = useSessionStore();

  useEffect(() => {
    // Check for session ID in URL
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session');
    
    if (sessionId) {
      console.log('Loading shared session:', sessionId);
      
      // Try to load from server
      fetch(`http://localhost:3002/api/sessions/${sessionId}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Session not found');
          }
          return response.json();
        })
        .then(sessionData => {
          console.log('Loaded session data:', sessionData);
          
          // Update the current session with loaded data
          if (sessionData.files && sessionData.files.length > 0) {
            const firstFile = sessionData.files[0];
            console.log('Updating file content:', firstFile.content);
            
            // Find the current file and update its content
            const currentFile = session.files[0];
            if (currentFile && currentFile.content !== firstFile.content) {
              updateFile(currentFile.id, firstFile.content);
            }
          }
        })
        .catch(error => {
          console.error('Failed to load session:', error);
        });
    }
  }, [session.id, updateFile]);

  // Save session when content changes
  useEffect(() => {
    if (session.files.length > 0) {
      const sessionData = {
        id: session.id,
        name: session.name,
        files: session.files,
        activeFileId: session.activeFileId,
        lastUpdated: new Date().toISOString()
      };

      console.log('Saving session:', sessionData);
      
      // Save to server
      fetch(`http://localhost:3002/api/sessions/${session.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData)
      }).catch(error => {
        console.error('Failed to save session:', error);
      });
    }
  }, [session.files, session.id, session.name]);
};
