import axios from "axios";
import { appStateId, appState } from "./components/common/libs/data"

let data = {
    santafe: axios.create({
        baseURL: appState[appStateId].apiUrl,
        headers: {
            "Content-type": "application/json"
        }
    }),
    santafe_meta: axios.create({
        baseURL: appState[appStateId].apiMetaUrl,
        headers: {
            "Content-type": "application/json"
        }
    })
}
export default data