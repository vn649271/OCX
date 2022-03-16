import React, { Component } from 'react';
import axios from 'axios';

export default class PreFileUploadForm extends Component {

    state = {
        file: null,
        fileName: '',
        status: '',
        image: { preview: '', data: '' }
    }

    constructor(props) {
        super(props);
        this.uploadURL = props.uploadURL;

        this.setFile = this.setFile.bind(this);
        this.setFileName = this.setFileName.bind(this);
        this.setImage = this.setImage.bind(this);
        this.setStatus = this.setStatus.bind(this);
        this.handleFileChange = this.handleFileChange.bind(this);
        this.uploadFile = this.uploadFile.bind(this);
    }

    setFile = file => { this.setState({file: file}); }
    setFileName = fileName => { this.setState({fileName: fileName}); }
    setImage = image => { this.setState({image: image}); }
    setStatus = status => { this.setState({status: status}); }

    handleFileChange = async (e) => {
        this.setFile(e.target.files[0]);
        this.setFileName(e.target.files[0].name);
        const img = {
            preview: URL.createObjectURL(e.target.files[0]),
            data: e.target.files[0],
        }
        this.setImage(img);
        this.props.onSelectFile({file: e.target.files[0], fileName: e.target.files[0].name});
    }

    uploadFile = async (e) => {
        e.preventDefault()
        const formData = new FormData();
        formData.append("file", this.state.file);
        formData.append("fileName", this.state.fileName);
        try {
            const res = await axios.post(
                this.props.uploadURL,
                formData
            );
        } catch (ex) {
            this.setState({status: ex});
        }
    }

    render = () => {
        return (
            <div className="FileUploadForm">
                <h1 className="main-font font-16">{this.props.title}</h1>
                <input type='file' name='file' onChange={this.handleFileChange}></input>
                {this.state.image.preview && <img src={this.state.image ? this.state.image.preview: ""} alt="" width='300' height='300' />}
            </div>
        );
    }
}
