/**
 * @description       : Controller class for community authentication
 * @author            : Christian Niro
 * @group             :
 * @last modified on  : 07-01-2024
 * @last modified by  : 
 **/
public class CommunityAuthController{
    @AuraEnabled
    public static String doLogin(String username, String password){
        try{
            String startUrl = System.Label.Community_Url;
            ApexPages.PageReference pageRef = Site.login(username, password, startUrl);
            if (pageRef != null)
                return pageRef.getUrl();
            else
                throw new CalloutException();
        } catch (Exception e){
            System.debug('Login Error: ' + e.getMessage());
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static Boolean isEmailExist(String username){
        List<User> userList = [SELECT Id
                               FROM User
                               WHERE Username = :username
                               LIMIT 1];
        return !userList.isEmpty();
    }

    @AuraEnabled
    public static String registerUser(String firstName, String lastName, String username, String email, String communityNickname, String password, String phone){
        try{

            Set<String> communityNicknameSet = new Set<String>();

            for (User usr : [SELECT Id, CommunityNickname
                             FROM User
                             WHERE CommunityNickname <> NULL]){

                communityNicknameSet.add(usr.CommunityNickname);
            }

            String uniqueCommunityNickName = generateUniqueCommunityNickname(communityNickname, communityNicknameSet);

            User newUser = new User(
                FirstName = firstName, 
                LastName = lastName, 
                Username = username, 
                Email = email, 
                Phone = phone, 
                CommunityNickname = uniqueCommunityNickName
            );

            Account portalAccount = new Account(
                Name = firstName + ' ' + lastName
            );

            insert portalAccount;

            system.debug('<<<<username' + username);

            String userId = Site.createPortalUser(newUser, portalAccount.Id, password);
            ApexPages.PageReference pageRef;

            if (userId == null)
                throw new CalloutException('Fail Create User');
            String emailResult = sendWelcomeMail(newUser, userId);

            if (password != null && password.length() > 8){
                pageRef = Site.login(username, password, null);
            } else{
                pageRef = System.Page.SiteRegisterConfirm;
                pageRef.setRedirect(true);
            }
            return (pageRef != null) ? pageRef.getUrl() : 'Login URL not available. User created successfully with ID: ' + userId + '\n' + emailResult;
        } catch (Exception e){
            System.debug('Registration Exception: ' + e.getMessage());
            if (!Test.isRunningTest())
                throw new AuraHandledException(e.getMessage());
            return 'Error: ' + e.getMessage();
        }
    }

    private static String generateUniqueCommunityNickname(String communityNickname, Set<String> communityNicknameSet){
        String baseNickname = communityNickname.length() > 4 ? communityNickname.substring(0, 4) : communityNickname;
        for (Integer i = 0; i <= 9999; i++){
            String candidate = baseNickname + String.valueOf(Math.round(Math.random() * 10000));
            if (!communityNicknameSet.contains(candidate))
                return candidate;
        }
        return baseNickname;
    }

    @AuraEnabled
    public static String sendWelcomeMail(User usr, String userId){

        try{

            Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();

            List<EmailTemplate> welcomeTemplate = new List<EmailTemplate>([SELECT Id
                                                                           FROM EmailTemplate
                                                                           WHERE name = 'Experience Cloud: New Member Welcome Email']);

            mail.setSenderDisplayName(System.Label.Community_Email_Sender);
            mail.setTargetObjectId(userId);
            mail.setTemplateId(welcomeTemplate[0].Id);
            mail.setSaveAsActivity(false);

            Messaging.sendEmail(new List<Messaging.SingleEmailMessage>{ mail });

            return 'success';

        } catch (Exception e){
            throw new AuraHandledException(e.getMessage());
        }
    }

}