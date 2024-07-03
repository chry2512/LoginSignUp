/**
 * @description       : login js controller
 * @author            : Christian Niro
 * @group             : 
 * @last modified on  : 07-03-2024
 * @last modified by  : 
**/

import { LightningElement, track } from 'lwc';
import doLogin from '@salesforce/apex/CommunityAuthController.doLogin';


export default class LoginComponent extends LightningElement {

    // Dichiarazione delle variabili per username e password senza inizializzazione
    username;
    password;
    // @track consente di monitorare le modifiche alle variabili per il rendering condizionale in LWC
    @track errorCheck;
    @track errorMessage;

    // connectedCallback() è un lifecycle hook chiamato quando il componente viene inserito nel DOM
    connectedCallback(){
        // Crea un elemento meta per configurare la viewport per dispositivi mobili
        var meta = document.createElement("meta");
        meta.setAttribute("name", "viewport");
        meta.setAttribute("content", "width=device-width, initial-scale=1.0");
        // Aggiunge l'elemento meta al tag <head> del documento
        document.getElementsByTagName('head')[0].appendChild(meta);
    }

    // Gestisce il cambiamento dell'username aggiornando la variabile con il valore inserito
    handleUserNameChange(event){
        this.username = event.target.value;
    }

    // Gestisce il cambiamento della password aggiornando la variabile con il valore inserito
    handlePasswordChange(event){
        this.password = event.target.value;
    }

    // Gestisce il tentativo di login
    handleLogin(event){
       // Controlla se sono stati inseriti sia username che password
       if(this.username && this.password){
        // Previene il comportamento di default dell'evento, tipicamente il submit di un form
        event.preventDefault();

        // Chiama la funzione doLogin importata da Apex, passando username e password
        doLogin({ username: this.username, password: this.password })
            .then((result) => {
                // In caso di successo, reindirizza l'utente all'URL restituito da doLogin
                window.location.href = result;
            })
            .catch((error) => {
                // In caso di errore, imposta le variabili per mostrare il messaggio di errore
                this.error = error;      
                this.errorCheck = true;
                this.errorMessage = error.body.message;
            });
        }
    }
}