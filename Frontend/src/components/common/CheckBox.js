import { Component } from "react";

export default class CheckBox extends Component{

    state = {
        label: '',
        checked: false,
    }

    constructor(props) {
        super(props);
        this.setState({label: props.label});
        this.setState({checked: props.checked});
    }

    render() {
        return (
            <div class="form-check">
                <input 
                    class="form-check-input appearance-none h-4 w-4 border border-gray-300 rounded-sm bg-white checked:bg-blue-600 checked:border-blue-600 focus:outline-none transition duration-200 mt-1 align-top bg-no-repeat bg-center bg-contain float-left mr-2 cursor-pointer" 
                    type="checkbox" 
                    value="" 
                    id="flexCheckChecked" 
                    checked={this.state.checked ? true : false}
                />
                <label class="form-check-label inline-block text-gray-800" for="flexCheckChecked">
                    {this.state.label}
                </label>
            </div>
        );
    }
}
