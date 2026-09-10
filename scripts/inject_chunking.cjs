const fs = require('fs');

// Update SpyListener.tsx
let listenerCode = fs.readFileSync('src/components/SpyListener.tsx', 'utf8');

listenerCode = listenerCode.replace(
  /channel\.send\(\{\s*type: 'broadcast',\s*event: 'rrweb_events',\s*payload: \{ events: eventBuffer \}\s*\}\);\s*eventBuffer = \[\];/g,
  `const payloadStr = JSON.stringify(eventBuffer);
          eventBuffer = [];
          
          const CHUNK_SIZE = 150000; // 150KB to stay under 256KB limit safely
          const totalChunks = Math.ceil(payloadStr.length / CHUNK_SIZE);
          const chunkGroupId = Date.now().toString() + Math.random().toString(36).substr(2, 5);

          const sendChunks = async () => {
            for (let i = 0; i < totalChunks; i++) {
              const chunk = payloadStr.substring(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
              await channel.send({
                type: 'broadcast',
                event: 'rrweb_chunk',
                payload: { chunkGroupId, chunkIndex: i, totalChunks, data: chunk }
              });
              await new Promise(r => setTimeout(r, 40));
            }
          };
          sendChunks();`
);

fs.writeFileSync('src/components/SpyListener.tsx', listenerCode);

// Update SpyViewerModal.tsx
let viewerCode = fs.readFileSync('src/components/SpyViewerModal.tsx', 'utf8');

const newViewerLogic = `
    let events: any[] = [];
    let chunkGroups: Record<string, string[]> = {};

    channel.on('broadcast', { event: 'rrweb_chunk' }, (payload) => {
      const { chunkGroupId, chunkIndex, totalChunks, data } = payload.payload;
      
      if (!chunkGroups[chunkGroupId]) {
        chunkGroups[chunkGroupId] = new Array(totalChunks).fill(null);
      }
      
      chunkGroups[chunkGroupId][chunkIndex] = data;

      if (chunkGroups[chunkGroupId].every(c => c !== null)) {
        const fullPayloadStr = chunkGroups[chunkGroupId].join('');
        delete chunkGroups[chunkGroupId];
        
        try {
          const incomingEvents = JSON.parse(fullPayloadStr);
          if (!incomingEvents || incomingEvents.length === 0) return;
          
          setStatus('Connected (Live)');

          if (!replayerRef.current && containerRef.current) {
             events.push(...incomingEvents);
             if (events.some(e => e.type === 2)) {
                replayerRef.current = new rrweb.Replayer(events, {
                  root: containerRef.current,
                  liveMode: true,
                });
                replayerRef.current.play();
             }
          } else if (replayerRef.current) {
             incomingEvents.forEach((ev: any) => replayerRef.current.addEvent(ev));
          }
        } catch(e) {
          console.error("Failed to parse chunked events", e);
        }
      }
    });
`;

viewerCode = viewerCode.replace(
  /let events: any\[\] = \[\];[\s\S]*?\}\);\s*\}\);/g,
  newViewerLogic + `\n\n    channel.subscribe((subStatus) => {`
);

fs.writeFileSync('src/components/SpyViewerModal.tsx', viewerCode);

console.log("Chunking logic injected successfully.");
