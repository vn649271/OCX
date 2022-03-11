import React, { Component } from 'react';
import Modal from "@material-tailwind/react/Modal";
import ModalHeader from "@material-tailwind/react/ModalHeader";
import ModalBody from "@material-tailwind/react/ModalBody";
import ModalFooter from "@material-tailwind/react/ModalFooter";
import Button from "@material-tailwind/react/Button";

class PasscodeConfirmDialog extends Component {

    constructor(props) {
        super(props);

        this.state = {
            info: '',
            error: '',
            showModal: false,
            input: {
                password: '',
            },
        }
        this.closeMeWithOk = props.onOk;
        this.closeMeWithCancel = props.onCancel;
        this.handleInputChange = this.handleInputChange.bind(this);
        this.setShowModal = this.setShowModal.bind(this);
        this.onOk = this.onOk.bind(this);
        this.onCancel = this.onCancel.bind(this);
        this.inform = this.inform.bind(this);
        this.warning = this.warning.bind(this);
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
        this.setState({showModal: show})
    }

    componentDidUpdate(prevProps) {
        if (prevProps.show !== this.props.show 
        && this.state.showModal !== this.props.show) {
            this.setState({showModal: this.props.show});
        }
    }

    handleInputChange = ev => {
        this.warning('');
        let input = this.state.input;
        input[ev.target.name] = ev.target.value;
        this.setState({
            input
        });
    }

    onOk = (ev) => {
        this.setShowModal(false);
        this.closeMeWithOk(this.state.input.password);
    }

    onCancel = ev => {
        this.setShowModal(false);
        this.closeMeWithCancel();
    }

    render() {
        return (
            <Modal size="regular" active={this.state.showModal} toggler={() => this.setShowModal(false)}>
                    <ModalHeader toggler={() => this.setShowModal(false)}>
                        <div className="dialog-title">
                            Passcode confirm
                        </div>
                    </ModalHeader>
                    <ModalBody>
                        <div className="account-password-container block w-full">
                            <input
                                type="password"
                                className="password-input border border-grey-light bg-gray-100 p-5 font-16 main-font focus:outline-none rounded "
                                name="password"
                                value={this.state.input.password}
                                onChange={this.handleInputChange}
                                placeholder="Password" autoComplete="off" />
                        </div>
                        <p className="account-balance-box main-font text-red-400 mb-100 font-16">{this.state.error}</p>
                        <p className="help-block main-font text-green-400 font-16">{this.state.info}</p>
                    </ModalBody>
                    <ModalFooter>
                        <Button 
                            className="main-font dialog-button"
                            color="blue"
                            buttonType="link"
                            onClick={this.onOk}
                            ripple="dark"
                        >
                            Ok
                        </Button>
                        <Button 
                            className="main-font dialog-button"
                            color="red"
                            buttonType="link"
                            onClick={this.onCancel}
                            ripple="dark"
                        >
                            Cancel
                        </Button>
                    </ModalFooter>
                </Modal>
        );
    }
}

export default PasscodeConfirmDialog;