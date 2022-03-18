import { Component } from "react";

export default class Card extends Component{

    constructor(props) {
        super(props);
    }
    // const [value, setValue] = React.useState(new Date());

    render() {
        return (
            <div className="bg-white p-10 rounded-lg shadow-md">
                <h1 className="main-font font-28 mb-10">{this.props.title}</h1>
                {this.props.children}
            </div>
        );
    }
}