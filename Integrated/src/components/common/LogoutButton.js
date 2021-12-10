import { useHistory } from "react-router-dom";

export default function LogoutButton(props) {
    let history = useHistory();

    function handleLogOut() {
        sessionStorage.setItem("userToken", '');
        sessionStorage.clear();
        history.push("/"); // whichever component you want it to route to
    }

    return (
        <button type="button" onClick={handleLogOut} className="profile-dropdown-item border-b-2 rounded-none w-full text-left block capitalize main-font font-14 hover-bg-blue hover:text-white cursor-pointer m-0  px-5  main-color-blue">
            Log out
        </button>
    );
}
