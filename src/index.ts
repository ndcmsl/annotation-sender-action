import { getInput, setFailed } from '@actions/core';
import fetch from 'node-fetch';

const host: string = getInput('host');
const port: string = getInput('port');
const microservice: string = getInput('microservice');
const dashboardUID: string = getInput('dashboardUID');
const panelId: number = parseInt(getInput('release'));
const grafanaToken: string = getInput('grafanaToken');
const mode: string = getInput('mode');
const infrastructure: string = getInput('infrastructure');
const release: string = getInput('release');

async function addAnnotation(): Promise<void> {

    const body = {
        dashboardUID,
        panelId,
        time: Date.now(),
        tags: [mode, microservice, infrastructure],
        text: `${microservice} ${release}`
    }

    await fetch(`http://${host}:${port}/api/annotations`,
        {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${grafanaToken}`
            },
            body: JSON.stringify(body)
        });
}

async function main() {
    await addAnnotation();
}

try {
    main();
} catch (error) {
    setFailed(error.message);
}