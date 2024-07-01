/**
 * @description       : registerComponent controller JS
 * @author            :  Christian Niro
 * @group             : 
 * @last modified on  : 07-01-2024
 * @last modified by  : 
**/
import { LightningElement, track } from 'lwc';
import isEmailExist from '@salesforce/apex/CommunityAuthController.isEmailExist';
import registerUser from '@salesforce/apex/CommunityAuthController.registerUser';

export default class RegisterComponent extends LightningElement {
    @track userInfo = {
        firstName: null,
        lastName: null,
        email: null,
        phoneNumber: null,
        userName: null,
        password: null,
        confirmPassword: null,
    };

    @track errorCheck;
    @track errorMessage;
    showUserName = false;
    @track showTermsAndConditions = false;
    @track showTermsAndConditionsLoading = false;
    @track infoTooltipDisplayData = {};
    @track requiredTooltipDisplayData = {};
    @track errorTooltipDisplayData = {};
    @track emailError;
    @track passwordError;
    @track phoneError;
    @track selectedClinicCenter; 
    clinicCenterOptions = [
        { label: 'Centro Clinico A', value: 'a' },
        { label: 'Centro Clinico B', value: 'b' },
        { label: 'Centro Clinico C', value: 'c' },
    ];

    get isEmailValid() {
        return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(this.userInfo.email);
    }

    get isPhoneNumberValid() {
        return /^\+39\d{9,10}$/.test(this.userInfo.phoneNumber);
    }

    get isPasswordValid() {
        return /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/.test(this.userInfo.password);
    }

    get doPasswordsMatch() {
        return this.userInfo.password === this.userInfo.confirmPassword;
    }

    connectedCallback() {
   
        this.infoTooltipDisplayData = {
            username: "tooltiptext",
            password: "tooltiptext",
            firstName: "tooltiptext",
            lastName: "tooltiptext",
            email: "tooltiptext",
            phoneNumber: "tooltiptext",
            password: "tooltiptext",
            confirmPassword: "tooltiptext"
        };

        const tooltipHide = 'tooltiptext tooltipHide';

        this.requiredTooltipDisplayData = {
            firstName: tooltipHide,
            lastName: tooltipHide,
            email: tooltipHide,
            phoneNumber: tooltipHide,
            username: tooltipHide,
            password: tooltipHide,
            confirmPassword: tooltipHide,
        };

        this.errorTooltipDisplayData = {
            email: tooltipHide,
            password: tooltipHide,
            phoneNumber: tooltipHide
        };
    }

    updateTooltipDisplayData(field, show) {
        const displayValue = `tooltiptext ${show ? 'tooltipShow' : 'tooltipHide'}`;
        if (field in this.requiredTooltipDisplayData) {
            this.requiredTooltipDisplayData[field] = displayValue;
        }
        if (field in this.errorTooltipDisplayData) {
            this.errorTooltipDisplayData[field] = displayValue;
        }
    }

    validateField(field, value) {
        this.updateTooltipDisplayData(field, !value);
    }

    handleRegister(event) {

        event.preventDefault();
        this.errorCheck = false;
        this.errorMessage = null;
        console.log('entrato nel register');
        
        Object.keys(this.userInfo).forEach(field => {
            this.validateField(field, this.userInfo[field]);
        });

        if (Object.values(this.userInfo).every(value => value)) {
            this.showTermsAndConditionsLoading = true;
            if (!this.doPasswordsMatch) {
                this.passwordError = 'Le password non corrispondono.';
                this.updateTooltipDisplayData('password', true);
                this.showTermsAndConditionsLoading = false;
                return;
            }

            if (!this.isPasswordValid) {
                this.passwordError = 'La password deve contenere almeno otto caratteri, una lettera, un numero e un carattere speciale.';
                this.updateTooltipDisplayData('password', true);
                this.showTermsAndConditionsLoading = false;
                return;
            }

            if (!this.isEmailValid) {
                this.emailError = 'Inserisci un indirizzo email valido.';
                this.updateTooltipDisplayData('email', true);
                this.showTermsAndConditionsLoading = false;
                return;
            }

            if(!this.isPhoneNumberValid){
                this.phoneError = 'Inserisci un numero di telefono valido.';
                this.updateTooltipDisplayData('phoneNumber', true);
                this.showTermsAndConditionsLoading = false;
                return;
            }

            isEmailExist({ username: this.userInfo.userName })
                .then(result => {
                    if (result) {
                        this.emailError = 'Il tuo username esiste già ';
                        this.updateTooltipDisplayData('email', true);
                    } else {
                        console.log(' parte register');    
                        this.registerNewUser();
                    }
                })
                .catch(error => {
                    console.error('Errore:', error);
                })
                .finally(() => {
                    this.showTermsAndConditionsLoading = false;
                });
        }
    }

    registerNewUser() {
        registerUser({ firstName : this.userInfo.firstName, lastName : this.userInfo.lastName, userName : this.userInfo.userName, email : this.userInfo.email, communityNickname: this.userInfo.firstName,  password : this.userInfo.password, phone: this.userInfo.phoneNumber})
            .then(result => {
                if (result) {
                    window.location.href = result;
                }
            })
            .catch(error => {
                console.error('Errore:', error);
                if (error && error.body && error.body.message) {
                    this.errorCheck = true;
                    this.errorMessage = error.body.message;
                }
            });
    }

    handleInputChange(event) {
        const { name, value } = event.target;
        this.userInfo[name] = value;
        if (name === 'email') {
            this.userInfo.userName = value ? `${value}.mrrob` : '';
        }
        if(name === 'phoneNumber'){
            if(!this.userInfo.phoneNumber.includes("+39"))
                this.userInfo.phoneNumber = "+39" + value;
        }
    }
    handleClinicCenterChange(event) {
        this.selectedClinicCenter = event.detail.value;
    }

    handleTermsAndConditions(event){

        this.showTermsAndConditions = true;
    }

    closeTermsAndConditions() {
        this.showTermsAndConditions = false;
    }

}
