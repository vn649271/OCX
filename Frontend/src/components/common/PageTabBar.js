import { Component } from 'react';


const active_class = "inline-block border border-blue-500 rounded py-1 px-3 bg-blue-500 text-white page-tab-item";
const inactive_class = "inline-block border border-white rounded hover:border-gray-200 text-blue-500 page-tab-item hover:bg-gray-200 py-1 px-3";

class PageTabBar extends Component {

    constructor(props) {
        super(props);

        this.state = {
            items: [],
            prevActiveItem: null
        }
        this.defaultActiveItemName = props.defaultActiveItem ? props.defaultActiveItem : null;
        this.menuItems = props.items;
        this.onClickTabItem = props.onClickItem;

        this.buildMenuItem = this.buildMenuItem.bind(this);
        this.onClickItem = this.onClickItem.bind(this);
    }

    componentWillMount() {
        for (let i in this.menuItems) {
            var itemList = this.state.items;
            var newItem = this.buildMenuItem(this.menuItems[i]);
            itemList.push(newItem);
            this.setState({ items: itemList });
        }
    }

    componentDidMount() {
        if (this.defaultActiveItemName) {
            var defaultActiveItem = document.getElementsByName(this.defaultActiveItemName);
            defaultActiveItem[0].className = active_class;
            this.setState({ prevActiveItem: defaultActiveItem[0] });
        }
    }

    onClickItem = (ev) => {
        if (this.state.prevActiveItem) {
            let prevActiveItem = this.state.prevActiveItem;
            prevActiveItem.className = inactive_class;
            this.setState({ prevActiveItem: prevActiveItem });
        }
        ev.target.className = active_class;
        this.onClickTabItem(ev.target.name);
        this.setState({ prevActiveItem: ev.target });
    }

    buildMenuItem(param) {
        return (
            <li key={param.name} className="mr-3 main-font font-16">
                <a name={param.name} className={inactive_class} href="#" onClick={this.onClickItem}>{param.title}</a>
            </li>
        );
    }

    render() {
        return (
            <ul className="page-menu-bar flex">
                {this.state.items}
            </ul>
        );
    }
}

export default PageTabBar;
