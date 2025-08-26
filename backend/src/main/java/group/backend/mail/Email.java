package group.backend.mail;


import javax.mail.*;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import java.util.Properties;



/*
Bibliotheks-Datei javax.mail.jar ->  https://github.com/javaee/javamail/releases
 */


public class Email {

    public  void sendEmail(String receiver , String subject, String text,  String Code) throws Exception {

        Properties properties = new Properties();

        properties.put("mail.smtp.auth","true");
        properties.put("mail.smtp.starttls.enable","true");
        properties.put("mail.smtp.host","smtp.gmail.com");
        properties.put("mail.smtp.port","587");

        Session session = Session.getInstance(properties, new Authenticator() {

            protected PasswordAuthentication getPasswordAuthentication(){
                return new PasswordAuthentication("sep.gruppe.6@gmail.com","fynfzxorwiufbkas");
            }

        });


        Message message = createMessage(session, "sep.gruppe.6@gmail.com",subject, text,receiver, Code );

        Transport.send(message);

        System.out.println("Email sent successfully");
    }



    private Message createMessage(Session session, String sender,String subject ,String text, String receiver, String authenticationCode){
        try {
            Message messsage = new MimeMessage(session);
            messsage.setRecipient(Message.RecipientType.TO, new InternetAddress(receiver));
            messsage.setFrom(new InternetAddress(sender));
            messsage.setSubject(subject);
            messsage.setText(text + authenticationCode);
            return messsage;

        } catch (MessagingException e) {
            e.getMessage();
        }
        return null;
    }
}