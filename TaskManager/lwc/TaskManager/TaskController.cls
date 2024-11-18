public class TaskController {

    @AuraEnabled(cacheable=true)
    public static List<Task__c> getTasks() {
        User currentUser = [SELECT Id FROM User WHERE Id = :UserInfo.getUserId()];
        return [
            SELECT Id, Name, Description__c, Due_Date__c, priority__c, Status__c FROM Task__c WHERE Assigned_To__c = :currentUser.Id
        ];
    }


    @AuraEnabled
    public static void createTask(String name, String description, Date dueDate, String priority, String status) {
     if (dueDate < Date.today()) {
        throw new AuraHandledException('Due date cannot be in the past.');
    }

    Task__c newTask = new Task__c(
        Name = name,
            Description__c = description,
            Due_Date__c = dueDate,
            Priority__c = priority,
            Status__c = status,
            Assigned_To__c = UserInfo.getUserId()
        );
        insert newTask;
    }


    @AuraEnabled 
public static void updateTaskStatus(Id taskId, String status) { 
            Task__c task = [SELECT Id, Status__c FROM Task__c WHERE Id = :taskId]; 
            task.Status__c = status; 
            update task; 
        }

    @AuraEnabled
    public static void deleteTask(Id taskId) {
        Task__c task = [SELECT Id FROM Task__c WHERE Id = :taskId];
        delete task;
    }
}
