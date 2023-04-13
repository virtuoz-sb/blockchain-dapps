import flagGB from "../../../../assets/img/flags/gb.svg"
import flagCN from "../../../../assets/img/flags/cn.svg"
import flagRU from "../../../../assets/img/flags/ru.svg"
import flagJP from "../../../../assets/img/flags/jp.svg"
// import flagKR from "../../../../assets/img/flags/kr.svg"

export const cur_langs: {[key: string]: any} = {
    en : {
        img : flagGB,
        label : 'English',
        lang  : 'en'
    },
    jp : {
        img : flagJP,
        label : '日本語',
        lang  : 'jp'
    },
    cn : {
        img : flagCN,
        label : '中文',
        lang  : 'cn'
    },
    ru : {
        img : flagRU,
        label : 'Русский',
        lang  : 'ru'
    },
    // kr : {
    //     img : flagKR,
    //     label : '한국어',//'Korean',///
    //     lang  : 'kr'
    // }
}

// https://github.com/lipis/flag-icon-css/tree/master/flags/4x3