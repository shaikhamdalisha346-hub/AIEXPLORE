import localtunnel from 'localtunnel';

async function startTunnel() {
  const PORT = process.env.PORT || 5000;
  let password = 'N/A';
  try {
    const ipRes = await fetch('https://loca.lt/mytunnelpassword');
    password = (await ipRes.text()).trim();
  } catch (e) {
    // Ignore error
  }

  console.log('================================================================');
  console.log('AI TOOL FINDER — PUBLIC LIVE INTERNET TUNNEL');
  console.log('================================================================');
  console.log(`Tunnel Password / IP (if prompted on first visit): ${password}\n`);

  try {
    const tunnel = await localtunnel({ port: PORT });
    console.log(`\n================================================================`);
    console.log(`PUBLIC LIVE URL: ${tunnel.url}`);
    console.log(`================================================================\n`);
    console.log('Public URL is active and routing directly to AI TOOL FINDER on port ' + PORT);

    tunnel.on('close', () => {
      console.log('Tunnel connection closed. Reconnecting in 3 seconds...');
      setTimeout(startTunnel, 3000);
    });

    tunnel.on('error', (err) => {
      console.error('Tunnel error:', err.message);
      setTimeout(startTunnel, 3000);
    });
  } catch (err) {
    console.error('Failed to establish tunnel:', err.message);
    setTimeout(startTunnel, 5000);
  }
}

startTunnel();
