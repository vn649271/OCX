import React, { Component } from 'react';
import Modal from "@material-tailwind/react/Modal";
import ModalHeader from "@material-tailwind/react/ModalHeader";
import ModalBody from "@material-tailwind/react/ModalBody";
import ModalFooter from "@material-tailwind/react/ModalFooter";
import Button from "@material-tailwind/react/Button";

class RegularModal extends Component {

    constructor(props) {
        super(props);

        this.state = {
            showModal: false
        }
        this.closeMe = props.onClose;
        this.dialogTitle = props.title;
        this.dialogContent = props.content;
        this.setShowModal = this.setShowModal.bind(this);
    }

    setShowModal = show => {
        this.setState({showModal: show})
        this.closeMe();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.show !== this.props.show && this.state.showModal !== this.props.show) {
            this.setState({showModal: this.props.show});
        }
    }

    render() {
        return (
            <Modal size="regular" active={this.state.showModal} toggler={() => this.setShowModal(false)}>
                    <ModalHeader toggler={() => this.setShowModal(false)}>
                        {this.props.title}
                    </ModalHeader>
                    <ModalBody>
                        <p className="text-base leading-relaxed text-gray-600 font-normal">
                            {this.props.content}
                        </p>
                    </ModalBody>
                    <ModalFooter>
                        <Button 
                            color="red"
                            buttonType="link"
                            onClick={(e) => this.setShowModal(false)}
                            ripple="dark"
                        >
                            {this.props.cancelButtonName}
                        </Button>

                        <Button
                            color="green"
                            onClick={(e) => this.setShowModal(false)}
                            ripple="light"
                        >
                            {this.props.okButtonName}
                        </Button>
                    </ModalFooter>
                </Modal>
        );
    }
}

export default RegularModal;