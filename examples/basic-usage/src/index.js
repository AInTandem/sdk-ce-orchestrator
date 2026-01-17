import { AInTandemClient } from '@aintandem/sdk-core';
const CONFIG = {
    baseURL: process.env.API_BASE_URL || 'https://api.aintandem.com',
    username: process.env.API_USERNAME || 'admin',
    password: process.env.API_PASSWORD || 'admin123',
    projectId: process.env.PROJECT_ID || 'demo-project',
    workflowId: process.env.WORKFLOW_ID || '',
    stepId: process.env.STEP_ID || 'step-1',
};
const client = new AInTandemClient({
    baseURL: CONFIG.baseURL,
});
async function exampleAuthentication() {
    console.log('\n=== Example 1: Authentication ===\n');
    try {
        const response = await client.auth.login({
            username: CONFIG.username,
            password: CONFIG.password,
        });
        console.log('✅ Login successful!');
        console.log('User:', response.user);
        console.log('Access Token:', response.token?.substring(0, 20) + '...');
        const isAuthenticated = client.auth.isAuthenticated();
        console.log('Is Authenticated:', isAuthenticated);
        const isValid = await client.auth.verify();
        console.log('Token Valid:', isValid);
    }
    catch (error) {
        console.error('❌ Authentication failed:', error);
    }
}
async function exampleListWorkflows() {
    console.log('\n=== Example 2: List Workflows ===\n');
    try {
        const workflows = await client.workflows.listWorkflows('published');
        console.log(`✅ Found ${workflows.length} published workflows:`);
        workflows.forEach((workflow, index) => {
            console.log(`\n${index + 1}. ${workflow.name}`);
            console.log(`   ID: ${workflow.id}`);
            console.log(`   Description: ${workflow.description}`);
            console.log(`   Status: ${workflow.status}`);
            console.log(`   Version: ${workflow.version}`);
        });
    }
    catch (error) {
        console.error('❌ Failed to list workflows:', error);
    }
}
async function exampleGetWorkflowDetails(workflowId) {
    console.log('\n=== Example 3: Get Workflow Details ===\n');
    try {
        const workflow = await client.workflows.getWorkflow(workflowId);
        console.log('✅ Workflow Details:');
        console.log('Name:', workflow.name);
        console.log('Description:', workflow.description);
        console.log('Status:', workflow.status);
        console.log('Version:', workflow.version);
        console.log('\nPhases:');
        workflow.definition.phases.forEach((phase, index) => {
            console.log(`\n  ${index + 1}. ${phase.title || phase.id}`);
            console.log(`     Description: ${phase.description}`);
            console.log(`     Color: ${phase.color}`);
            console.log(`     Steps: ${phase.steps.length}`);
            phase.steps.forEach((step, stepIndex) => {
                console.log(`       ${stepIndex + 1}. ${step.title || step.id} (type: ${step.type})`);
            });
        });
    }
    catch (error) {
        console.error('❌ Failed to get workflow:', error);
    }
}
async function exampleCreateWorkflow() {
    console.log('\n=== Example 4: Create Workflow ===\n');
    try {
        const request = {
            name: 'Example Workflow',
            description: 'A sample workflow created by SDK',
            definition: {
                phases: [
                    {
                        id: 'phase-1',
                        title: 'Analysis Phase',
                        titleEn: 'Analysis Phase',
                        description: 'First phase of the workflow',
                        color: '#3B82F6',
                        steps: [
                            {
                                id: 'step-1',
                                title: 'Data Analysis',
                                titleEn: 'Data Analysis',
                                description: 'Analyze the input data',
                                type: 'process',
                                prompt: 'Please analyze the provided data',
                            },
                        ],
                    },
                ],
                transitions: [],
            },
        };
        const workflow = await client.workflows.createWorkflow(request);
        console.log('✅ Workflow created successfully!');
        console.log('ID:', workflow.id);
        console.log('Name:', workflow.name);
        console.log('Status:', workflow.status);
        return workflow.id;
    }
    catch (error) {
        console.error('❌ Failed to create workflow:', error);
        return null;
    }
}
async function exampleExecuteAdhocTask() {
    console.log('\n=== Example 5: Execute Ad-hoc Task ===\n');
    try {
        const request = {
            title: 'Data Analysis Task',
            description: 'Analyze sales data for trends',
            prompt: 'Please analyze the sales data for Q4 2024 and identify key trends',
            taskType: 'claude',
            parameters: {
                dataset: 'sales-2024-q4',
            },
        };
        const task = await client.tasks.executeAdhocTask(CONFIG.projectId, request);
        console.log('✅ Ad-hoc task submitted successfully!');
        console.log('Task ID:', task.taskId);
        console.log('Message:', task.message);
        return task.taskId;
    }
    catch (error) {
        console.error('❌ Failed to execute ad-hoc task:', error);
        return null;
    }
}
async function exampleGetTaskStatus(taskId) {
    console.log('\n=== Example 6: Get Task Status ===\n');
    try {
        const task = await client.tasks.getTaskStatus(CONFIG.projectId, taskId);
        console.log('✅ Task Status:');
        console.log('Task ID:', task.taskId);
        console.log('Message:', task.message);
    }
    catch (error) {
        console.error('❌ Failed to get task status:', error);
    }
}
async function exampleListTaskHistory() {
    console.log('\n=== Example 7: Task History ===\n');
    try {
        const history = await client.tasks.listTaskHistory(CONFIG.projectId, {
            limit: 10,
        });
        console.log(`✅ Found ${history.length} recent tasks:`);
        history.forEach((task, index) => {
            console.log(`\n${index + 1}. Task ID: ${task.taskId}`);
            console.log(`   Message: ${task.message}`);
        });
    }
    catch (error) {
        console.error('❌ Failed to get task history:', error);
    }
}
async function exampleListOrganizations() {
    console.log('\n=== Example 8: List Organizations ===\n');
    try {
        const organizations = await client.workspaces.listOrganizations();
        console.log(`✅ Found ${organizations.length} organizations:`);
        organizations.forEach((org, index) => {
            console.log(`\n${index + 1}. ${org.name}`);
            console.log(`   ID: ${org.id}`);
            console.log(`   Folder Path: ${org.folderPath || 'N/A'}`);
            console.log(`   Created: ${new Date(org.createdAt).toLocaleString()}`);
        });
    }
    catch (error) {
        console.error('❌ Failed to list organizations:', error);
    }
}
async function exampleListWorkspaces() {
    console.log('\n=== Example 9: List Workspaces ===\n');
    try {
        const organizations = await client.workspaces.listOrganizations();
        if (organizations.length === 0) {
            console.log('No organizations found');
            return;
        }
        const orgId = organizations[0]?.id;
        if (!orgId) {
            console.log('Invalid organization ID');
            return;
        }
        const workspaces = await client.workspaces.listWorkspaces(orgId);
        const firstOrg = organizations[0];
        console.log(`✅ Found ${workspaces.length} workspaces in ${firstOrg?.name || 'unknown'}:`);
        workspaces.forEach((workspace, index) => {
            console.log(`\n${index + 1}. ${workspace.name}`);
            console.log(`   ID: ${workspace.id}`);
            console.log(`   Folder Path: ${workspace.folderPath || 'N/A'}`);
            console.log(`   Created: ${new Date(workspace.createdAt).toLocaleString()}`);
        });
    }
    catch (error) {
        console.error('❌ Failed to list workspaces:', error);
    }
}
async function exampleListProjects() {
    console.log('\n=== Example 10: List Projects ===\n');
    try {
        const organizations = await client.workspaces.listOrganizations();
        if (organizations.length === 0) {
            console.log('No organizations found');
            return;
        }
        const orgId = organizations[0]?.id;
        if (!orgId) {
            console.log('Invalid organization ID');
            return;
        }
        const workspaces = await client.workspaces.listWorkspaces(orgId);
        if (workspaces.length === 0) {
            console.log('No workspaces found');
            return;
        }
        const workspaceId = workspaces[0]?.id;
        if (!workspaceId) {
            console.log('Invalid workspace ID');
            return;
        }
        const projects = await client.workspaces.listProjects(workspaceId);
        const firstWorkspace = workspaces[0];
        console.log(`✅ Found ${projects.length} projects in ${firstWorkspace?.name || 'unknown'}:`);
        projects.forEach((project, index) => {
            console.log(`\n${index + 1}. ${project.name}`);
            console.log(`   ID: ${project.id}`);
            console.log(`   Folder Path: ${project.folderPath || 'N/A'}`);
            console.log(`   Created: ${new Date(project.createdAt).toLocaleString()}`);
        });
    }
    catch (error) {
        console.error('❌ Failed to list projects:', error);
    }
}
async function main() {
    console.log('╔══════════════════════════════════════════════════════╗');
    console.log('║   AInTandem SDK - Basic Usage Example              ║');
    console.log('╚══════════════════════════════════════════════════════╝');
    try {
        await exampleAuthentication();
        await exampleListOrganizations();
        await exampleListWorkspaces();
        await exampleListProjects();
        await exampleListWorkflows();
        const workflows = await client.workflows.listWorkflows('published');
        if (workflows.length > 0) {
            const firstWorkflow = workflows[0];
            if (firstWorkflow) {
                await exampleGetWorkflowDetails(firstWorkflow.id);
            }
        }
        await exampleCreateWorkflow();
        const taskId = await exampleExecuteAdhocTask();
        if (taskId) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            await exampleGetTaskStatus(taskId);
            await exampleListTaskHistory();
        }
        console.log('\n✅ All examples completed successfully!');
    }
    catch (error) {
        console.error('\n❌ Example execution failed:', error);
        process.exit(1);
    }
    finally {
        client.auth.logout();
        console.log('\n👋 Logged out');
    }
}
main().catch(console.error);
