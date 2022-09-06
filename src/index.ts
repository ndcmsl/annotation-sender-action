import { getInput, setFailed } from '@actions/core';
import fetch from 'node-fetch';

const microservice = getInput('microservice');
const dashboardUID = getInput('dashboardUID');
const grafanaToken = getInput('grafanaToken');
const mode = getInput('mode');
const release = getInput('release');
const rowList = getInput('rowList').split(',');

async function addAnnotationsGrafana(panelIds): Promise<void> {

    panelIds.forEach(async panelId => {

        const body = {  
            dashboardUID,
            panelId,
            time: Date.now(),
            tags: [mode, release],
            text: microservice
        }
    
        const response = await fetch('http://localhost:3000/api/annotations',
            {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${grafanaToken}`
                },
                body: JSON.stringify(body)
            });
        const data = await response.json();

    });

}

async function listPanelsDashboardGrafana() {

    let panels: number[] = [];
    const response = await fetch(`http://localhost:3000/api/dashboards/uid/${dashboardUID}`,
        {
            headers: {
                'Authorization': `Bearer ${grafanaToken}`
            },
        });

    const { dashboard : {panels: elements}} = await response.json() as any;

    let lastRowIndex = -1;
    for (let index = 0; index < elements.length; index++) {
        const title = elements[index].title;

        if (elements[index].type == 'row') {
            const { collapsed } = elements[index];
            if (rowList.includes(title)) {
                if (collapsed) {
                    elements[index].panels.forEach(panel => {
                        panels.push(panel.id);
                    })
                }
                else {
                    lastRowIndex = index;
                }
            }
            else {
                lastRowIndex = -1;
            }
        }
        else {
            if (lastRowIndex != -1) {
                panels.push(elements[index].id);
            }
        }
        
    }

    return panels;
}

async function main() {
    let panelIds: number[] = await listPanelsDashboardGrafana();
    await addAnnotationsGrafana(panelIds);
}

try {
    main();
} catch (error) {
    setFailed(error.message); 
}