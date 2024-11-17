import { LightningElement, track, wire } from 'lwc';
import getTasks from '@salesforce/apex/TaskControllerNew.getTasks';
import createTask from '@salesforce/apex/TaskControllerNew.createTask';
import updateTaskStatus from '@salesforce/apex/TaskControllerNew.updateTaskStatus';
import deleteTask from '@salesforce/apex/TaskControllerNew.deleteTask';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import { refreshApex } from '@salesforce/apex';


export default class TasknewCreate extends LightningElement {
    @track tasks;

    wiredTaskResult = [];

    @track taskName = '';
    @track description = '';
    @track dueDate = '';
    @track priority = '';
    @track status = 'New';

    @track priorityOptions = [
        { label: 'Low', value: 'Low' },
        { label: 'Medium', value: 'Medium' },
        { label: 'High', value: 'High' }
    ];
    @track statusOptions = [
        { label: 'New', value: 'New' },
        { label: 'In Progress', value: 'In Progress' },
        { label: 'Completed', value: 'Completed' }
    ];
    columns = [
        { label: 'Task Name', fieldName: 'Name' },
        { label: 'Description', fieldName: 'Description__c' },
        { label: 'Due Date', fieldName: 'Due_Date__c' },
        { label: 'Priority', fieldName: 'priority__c' },
        { label: 'Status', fieldName: 'Status__c' },
        {
            type: 'button',
            typeAttributes: {
                label: 'Mark Completed',
                name: 'markCompleted',
                title: 'Mark Completed',
                disabled: {
                    fieldName: 'disableMarkCompleted'
                }
            }
        },
        {
            type: 'button',
            typeAttributes: {
                label: 'Mark In Progress',
                name: 'markInProgress',
                title: 'Mark In Progress',
                disabled: {
                    fieldName: 'disableMarkInProgress'
                }
            }
        },
        {
            type: 'button',
            typeAttributes: {
                label: 'Delete',
                name: 'delete',
                title: 'Delete',
                variant: 'destructive'
            }
        }
    ];



    @wire(getTasks)
    wiredtask(result) {
        this.wiredTaskResult = result;
        if (result.data) {
            this.tasks = result.data;
            this.error = undefined;
        } else if (result.error) {
            this.tasks = undefined;
            this.error = result.error;
        }
    }



    handleInputChange(event) {
        const field = event.target.dataset.id;
        this[field] = event.target.value;
    }

    createTask() {
        createTask({
            name: this.taskName,
            description: this.description,
            dueDate: this.dueDate,
            priority: this.priority,
            status: this.status
        }).then(() => {
            this.clearFormFields();
            refreshApex(this.wiredTaskResult);
            this.showToast('Task Record create successfully ', 'Success ', 'Success ');

        }).catch(error => {
                this.showToast('Error', error.body.message, 'error');
            
        });

    }
    clearFormFields() { 
        this.taskName = ''; 
        this.description = ''; 
        this.dueDate = ''; 
        this.priority = ''; 
        this.status = 'New'; 
    }

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        if (actionName === 'markCompleted') {
            this.updateTaskStatus(row.Id, 'Completed');
        } else if (actionName === 'markInProgress') {
            this.updateTaskStatus(row.Id, 'In Progress');
        }
        else if (actionName === 'delete') {
            this.deleteTask(row.Id);

        }
    }

    updateTaskStatus(taskId, status) {
        updateTaskStatus({ taskId, status })
            .then(() => {

                refreshApex(this.wiredTaskResult);
            }).catch(error => {
                console.error('Error updating task status:', error);
            });
    }


    deleteTask(taskId) {
        deleteTask({ taskId })
            .then(() => {
                this.showToast(' Record Delete Task ', 'Error ', 'error ');
                refreshApex(this.wiredTaskResult);


            }).catch(error => {
                console.error('Error deleting task:', error);
            });
    }


    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(event);
    }


}