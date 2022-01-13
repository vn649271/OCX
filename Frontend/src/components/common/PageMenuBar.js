import { Component } from 'react';

var self;

class PageMenuBar extends Component {

    constructor(props) {
        super(props);
        self = this;

        this.state = {
            items: []
        }

        this.menuItems = [
            {
                id: 'id-active',
                title: 'Active',
                link: '#'
            }, 
            {
                id: 'id-link',
                title: 'Link',
                link: '#'
            }
        ];
        this.onClickItem = props.onClickItem;

        this.buildMenuItem = this.buildMenuItem.bind(this);
        this.onClickItem = this.onClickItem.bind(this);
    }

    componentWillMount() {
        for (let i in this.menuItems) {
            var itemList = this.state.items;
            var newItem = this.buildMenuItem(this.menuItems[i]);
            console.log(":::::::::::::::::", itemList, newItem);
            itemList.push(newItem);
            this.setState({items: itemList});
        }
        console.log("PageMenuBar: ", this.state.items);
    }

    buildMenuItem(param) {
        return (
            <li id={param.id} className="mr-6 text-blue-500 hover:text-blue-800" onClick={this.onClickItem}>{param.title}</li>
        );
    }

    onClickItem = (ev) => {
        this.onClickItem(ev.target.id);
    }

    render() {
        return(
            <ul className="page-menu-bar flex">
                {this.state.items}
            </ul>
        );
    }
}

export default PageMenuBar;
