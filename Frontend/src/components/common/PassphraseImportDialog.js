import React, { Component } from 'react';
import Modal from "@material-tailwind/react/Modal";
import ModalHeader from "@material-tailwind/react/ModalHeader";
import ModalBody from "@material-tailwind/react/ModalBody";
import ModalFooter from "@material-tailwind/react/ModalFooter";
import Button from "@material-tailwind/react/Button";
import OcxPasswordChecklist from "./OcxPasswordChecklist";
import DelayButton from './DelayButton';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";

const eye = <FontAwesomeIcon icon={faEye} />;

class PassphraseImportDialog extends Component {

    constructor(props) {
        super(props);

        this.state = {
            info: '',
            error: '',
            showModal: false,
            showPassword: false,
            input: {
                importing_passphrase: '',
                new_password: '',
                confirm_password: ''
            },
            hidePasswordCheckList: true
        }
        this.closeMeWithOk = props.onOk;
        this.closeMeWithCancel = props.onCancel;
        this.retVal = -1;
        
        this.handleInputChange = this.handleInputChange.bind(this);
        this.onLeaveFromPasswordInput = this.onLeaveFromPasswordInput.bind(this);
        this.togglePasswordVisiblity = this.togglePasswordVisiblity.bind(this);
        this.setShowModal = this.setShowModal.bind(this);
        this.onRestoreAccount = this.onRestoreAccount.bind(this);
        this.onCancel = this.onCancel.bind(this);
        this.inform = this.inform.bind(this);
        this.warning = this.warning.bind(this);
        this.validatePassword = this.validatePassword.bind(this);
        this.clearAllFields = this.clearAllFields.bind(this);
        // this.inform = this.inform.bind(this);
    }

    inform = (msg) => {
        if (typeof msg === 'object') {
            msg = msg.toString();
        }
        this.setState({ info: msg });
        this.setState({ error: '' });
    }

    warning = (msg) => {
        if (typeof msg === 'object') {
            msg = msg.toString();
        }
        this.setState({ error: msg });
        this.setState({ info: '' });
    }

    setShowModal = show => {
        this.setState({showModal: show});
    }

    clearAllFields = () => {
        this.setState({input: {
            new_password: '',
            importing_passphrase: ''
        }});
    }

    componentDidUpdate(prevProps) {
        // Handle the case of outside clicking
        // if (this.closeMeWithCancel && this.retVal < 0 && this.state.showModal === false) {
        //     this.closeMeWithCancel();
        // }
        if (prevProps.show !== this.props.show && this.state.showModal !== this.props.show) {
            this.setState({showModal: this.props.show});
        }
    }

    validatePassword = (password, confirmPassword) => {
        var re = {
            'lowercase': /(?=.*[a-z])/,
            'uppercase': /(?=.*[A-Z])/,
            'numeric_char': /(?=.*[0-9])/,
            'special_char': /(?=.[!@#$%^&<>?()\-+*=|{}[\]:";'])/,
            'atleast_8': /(?=.{8,})/
        };
        if (!re.lowercase.test(password))
            return -1;
        if (!re.uppercase.test(password))
            return -2;
        if (!re.numeric_char.test(password))
            return -3;
        if (!re.special_char.test(password))
            return -4;
        if (!re.atleast_8.test(password))
            return -5;
        if (password !== confirmPassword)
            return -6;
        return 0;
    }

    handleInputChange = ev => {
        this.warning('');
        let input = this.state.input;
        input[ev.target.name] = ev.target.value;
        this.setState({
            input
        });
        if (ev.target.name === 'password') {
            this.setState({ hidePasswordCheckList: false });
            let password = input['new_password'] || "";
            if (password === null) {
                password = "";
            }
        } else if (ev.target.name === 'confirm_password') {
            let password = input['new_password'];
            let confirmPassword = input['confirm_password'];
            if (confirmPassword !== password) {
                this.warning('Password mismatch');
            }
        }
    }

    onLeaveFromPasswordInput = event => {
        this.setState({ hidePasswordCheckList: true });
    }

    togglePasswordVisiblity = ev => {
        // let password = event.target.parentNode.parentNode.parentNode.firstElementChild.value;
        this.setState({ showPassword: !this.state.showPassword });
    }

    onRestoreAccount = (param, ev, btnCmp) => {
        this.retVal = 1; // Ok
        btnCmp.stopTimer();
        let passwordValidation = this.validatePassword(
            this.state.input.new_password, 
            this.state.input.confirm_password
        );
        if (passwordValidation < 0) {
            this.warning("Invalid password");
            return;
        }
        this.setShowModal(false);
        var formValues = {
            password: this.state.input.new_password,
            passphrase: this.state.input.importing_passphrase
        };
        this.clearAllFields();
        this.closeMeWithOk(formValues);
    }

    onCancel = ev => {
        this.retVal = 0; // Cancel
        this.setShowModal(false)
        this.clearAllFields();
        this.closeMeWithCancel();
    }

    render() {
        return (
            <Modal 
            size="regular" 
            active={this.state.showModal} 
            toggler={() => { this.onCancel(); }}
            >
                <ModalHeader toggler={() => this.setShowModal(false)}>
                    <div className="dialog-title">
                        Import Passphrase
                    </div>
                </ModalHeader>
                <ModalBody>
                    <input
                        type="text"
                        className="block border border-grey-light bg-gray-100  w-full p-5 my-5 font-16 main-font focus:outline-none rounded mb-10"
                        name="importing_passphrase"
                        id="importing_passphrase"
                        placeholder="Your passphrase"
                        value={this.state.input.importing_passphrase}
                        onChange={this.handleInputChange}
                        autoComplete="off" />
                    <div className="mb-10">
                        <div className="account-password-container block w-full">
                            <input
                                type={this.state.showPassword ? "text" : "password"}
                                className="password-input border border-grey-light bg-gray-100 p-5 font-16 main-font focus:outline-none rounded "
                                name="new_password"
                                value={this.state.input.new_password}
                                onChange={this.handleInputChange}
                                onBlur={this.onLeaveFromPasswordInput}
                                placeholder="Password" autoComplete="off" />
                            <i className="ShowPasswordIcon font-16" onClick={this.togglePasswordVisiblity}>{eye}</i>
                        </div>
                    </div>
                    <OcxPasswordChecklist
                        password={this.state.input['new_password'] || ""}
                        confirmPassword={this.state.input['confirm_password'] || ""}
                        hidden={this.state.hidePasswordCheckList} />
                    <div className="mb-10">
                        <input
                            type="password"
                            className="block border border-grey-light bg-gray-100 w-full p-5 font-16 main-font focus:outline-none rounded "
                            name="confirm_password"
                            id="confirm_password"
                            value={this.state.input.confirm_password}
                            onChange={this.handleInputChange}
                            placeholder="Confirm Password" autoComplete="off" />
                    </div>
                    <p className="account-balance-box main-font text-red-400 mb-100 font-16">{this.state.error}</p>
                    <p className="help-block main-font text-green-400 font-16">{this.state.info}</p>
                </ModalBody>
                <ModalFooter>
                    <DelayButton
                        captionInDelay="Restoreing"
                        caption="Restore"
                        maxDelayInterval={30}
                        onClickButton={this.onRestoreAccount}
                        onClickButtonParam={null} />
                    <Button 
                        className="main-font dialog-button"
                        color="red"
                        buttonType="link"
                        onClick={(e) => this.onCancel()}
                        ripple="dark"
                    >
                        Cancel
                    </Button>
                </ModalFooter>
            </Modal>
        );
    }
}

export default PassphraseImportDialog;