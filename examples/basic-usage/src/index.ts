/**
 * AInTandem SDK - Basic Usage Example
 *
 * This example demonstrates the basic functionality of the AInTandem SDK:
 * 1. Client initialization
 * 2. Authentication
 * 3. Workflow management
 * 4. Task execution
 * 5. Real-time progress tracking
 */

import { AInTandemClient } from '@aintandem/sdk-core';

// Configuration
const CONFIG = {
  baseURL: process.env.API_BASE_URL || 'https://api.aintandem.com',
  username: process.env.API_USERNAME || 'demo-user',
  password: process.env.API_PASSWORD || 'demo-password',
  projectId: process.env.PROJECT_ID || 'demo-project',
};

// Initialize client
const client = new AInTandemClient({
  baseURL: CONFIG.baseURL,
});

/**
 * Example 1: Authentication
 */
async function exampleAuthentication() {
  console.log('\n=== Example 1: Authentication ===\n');

  try {
    // Login
    const response = await client.auth.login({
      username: CONFIG.username,
      password: CONFIG.password,
    });

    console.log('✅ Login successful!');
    console.log('User:', response.user);
    console.log('Access Token:', response.accessToken.substring(0, 20) + '...');

    // Check authentication status
    const isAuthenticated = client.auth.isAuthenticated();
    console.log('Is Authenticated:', isAuthenticated);

    // Verify token
    const isValid = await client.auth.verify();
    console.log('Token Valid:', isValid);

  } catch (error) {
    console.error('❌ Authentication failed:', error);
  }
}

/**
 * Example 2: List Workflows
 */
async function exampleListWorkflows() {
  console.log('\n=== Example 2: List Workflows ===\n');

  try {
    // Get published workflows
    const workflows = await client.workflows.listWorkflows('published');

    console.log(`✅ Found ${workflows.length} published workflows:`);
    workflows.forEach((workflow, index) => {
      console.log(`\n${index + 1}. ${workflow.name}`);
      console.log(`   ID: ${workflow.id}`);
      console.log(`   Description: ${workflow.description}`);
      console.log(`   Status: ${workflow.status}`);
    });

  } catch (error) {
    console.error('❌ Failed to list workflows:', error);
  }
}

/**
 * Example 3: Get Workflow Details
 */
async function exampleGetWorkflowDetails(workflowId: string) {
  console.log('\n=== Example 3: Get Workflow Details ===\n');

  try {
    const workflow = await client.workflows.getWorkflow(workflowId);

    console.log('✅ Workflow Details:');
    console.log('Name:', workflow.name);
    console.log('Description:', workflow.description);
    console.log('Status:', workflow.status);
    console.log('\nPhases:');
    workflow.definition.phases.forEach((phase, index) => {
      console.log(`\n  ${index + 1}. ${phase.name}`);
      console.log(`     Steps: ${phase.steps.length}`);
      phase.steps.forEach((step, stepIndex) => {
        console.log(`       ${stepIndex + 1}. ${step.name} (${step.task})`);
      });
    });

  } catch (error) {
    console.error('❌ Failed to get workflow:', error);
  }
}

/**
 * Example 4: Execute Task (Async)
 */
async function exampleExecuteAsyncTask() {
  console.log('\n=== Example 4: Execute Async Task ===\n');

  try {
    // Submit async task
    const task = await client.tasks.executeTask({
      projectId: CONFIG.projectId,
      task: 'data-analysis',
      input: {
        dataset: 'sales-2024',
        analysisType: 'trend',
      },
      async: true,
    });

    console.log('✅ Task submitted successfully!');
    console.log('Task ID:', task.id);
    console.log('Status:', task.status);

    return task.id;

  } catch (error) {
    console.error('❌ Failed to execute task:', error);
    return null;
  }
}

/**
 * Example 5: Get Task Details
 */
async function exampleGetTaskDetails(taskId: string) {
  console.log('\n=== Example 5: Get Task Details ===\n');

  try {
    const task = await client.tasks.getTask(CONFIG.projectId, taskId);

    console.log('✅ Task Details:');
    console.log('ID:', task.id);
    console.log('Task Name:', task.taskName);
    console.log('Status:', task.status);
    console.log('Created At:', new Date(task.createdAt).toLocaleString());

    if (task.completedAt) {
      console.log('Completed At:', new Date(task.completedAt).toLocaleString());
    }

    if (task.output) {
      console.log('\nOutput:');
      console.log(JSON.stringify(task.output, null, 2));
    }

    if (task.error) {
      console.log('\nError:', task.error);
    }

  } catch (error) {
    console.error('❌ Failed to get task details:', error);
  }
}

/**
 * Example 6: Task History
 */
async function exampleTaskHistory() {
  console.log('\n=== Example 6: Task History ===\n');

  try {
    const history = await client.tasks.getTaskHistory(CONFIG.projectId, {
      limit: 10,
    });

    console.log(`✅ Found ${history.length} recent tasks:`);
    history.forEach((task, index) => {
      console.log(`\n${index + 1}. ${task.taskName}`);
      console.log(`   ID: ${task.id}`);
      console.log(`   Status: ${task.status}`);
      console.log(`   Created: ${new Date(task.createdAt).toLocaleString()}`);
    });

    // Statistics
    const stats = {
      total: history.length,
      completed: history.filter(t => t.status === 'completed').length,
      failed: history.filter(t => t.status === 'failed').length,
      running: history.filter(t => t.status === 'running').length,
    };

    console.log('\n📊 Statistics:');
    console.log(`  Total: ${stats.total}`);
    console.log(`  Completed: ${stats.completed}`);
    console.log(`  Failed: ${stats.failed}`);
    console.log(`  Running: ${stats.running}`);

  } catch (error) {
    console.error('❌ Failed to get task history:', error);
  }
}

/**
 * Example 7: Queue Status
 */
async function exampleQueueStatus() {
  console.log('\n=== Example 7: Queue Status ===\n');

  try {
    const queue = await client.tasks.getQueueStatus(CONFIG.projectId);

    console.log('✅ Queue Status:');
    console.log('Pending:', queue.pending);
    console.log('Running:', queue.running);
    console.log('Completed:', queue.completed);
    console.log('Failed:', queue.failed);

  } catch (error) {
    console.error('❌ Failed to get queue status:', error);
  }
}

/**
 * Example 8: Real-time Progress Tracking
 */
async function exampleProgressTracking(taskId: string) {
  console.log('\n=== Example 8: Real-time Progress Tracking ===\n');

  try {
    let eventCount = 0;

    await client.subscribeToTask(
      CONFIG.projectId,
      taskId,
      // Progress event callback
      (event) => {
        eventCount++;
        console.log(`📡 [Event ${eventCount}] ${event.type}`);

        if (event.type === 'task_progress') {
          console.log(`   Progress: ${event.data.percent}%`);
          console.log(`   Step: ${event.data.currentStep}`);
        }
      },
      // Complete callback
      (event) => {
        console.log('✅ Task completed!');
        console.log('Duration:', event.data.duration, 'ms');
        console.log('Output:', JSON.stringify(event.output, null, 2));
      },
      // Error callback
      (event) => {
        console.error('❌ Task failed!');
        console.error('Error:', event.data.error);
      }
    );

    console.log('✅ Subscribed to task progress');
    console.log('Waiting for events...\n');

  } catch (error) {
    console.error('❌ Failed to subscribe to progress:', error);
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║   AInTandem SDK - Basic Usage Example              ║');
  console.log('╚══════════════════════════════════════════════════════╝');

  try {
    // 1. Authentication
    await exampleAuthentication();

    // 2. List workflows
    await exampleListWorkflows();

    // 3. Get workflow details (using first workflow ID)
    const workflows = await client.workflows.listWorkflows('published');
    if (workflows.length > 0) {
      await exampleGetWorkflowDetails(workflows[0].id);
    }

    // 4. Execute async task
    const taskId = await exampleExecuteAsyncTask();

    if (taskId) {
      // 5. Wait a bit for task to start
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 6. Get task details
      await exampleGetTaskDetails(taskId);

      // 7. Task history
      await exampleTaskHistory();

      // 8. Queue status
      await exampleQueueStatus();

      // 9. Progress tracking (will wait for completion)
      // await exampleProgressTracking(taskId);
      // Note: Uncomment the above line to track progress in real-time
      // This will block until the task completes
    }

    console.log('\n✅ All examples completed successfully!');

  } catch (error) {
    console.error('\n❌ Example execution failed:', error);
    process.exit(1);
  } finally {
    // Logout
    client.auth.logout();
    console.log('\n👋 Logged out');
  }
}

// Run examples
main().catch(console.error);
