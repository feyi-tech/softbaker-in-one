import { useState } from "react";
import { Fields } from "frontbacked-svg";
import { DIRECTIVES } from "../../../constants";


const useDirectives = (fields: Fields) => {
    const [ availableDirectives, setAvailableDirectives ] = useState<string[]>(DIRECTIVES)
    const [ allDirectives, setAllDirectives ] = useState<string[]>(DIRECTIVES)

    return {
        allDirectives, availableDirectives
    }

}

export default useDirectives