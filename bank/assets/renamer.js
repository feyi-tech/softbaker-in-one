
function getDomain() {
    const domain = document.location.hostname
    // Split the domain string by periods (.)
    var parts = domain.split('.');
    var name = ''

    // Check if the domain has at least two parts (e.g., example.com)
    name = `${parts[parts.length - 2]}.${parts[parts.length - 1]}`
    return name
}
function getDomainName() {
    const domain = getDomain()
    // Split the domain string by periods (.)
    var parts = domain.split('.');
    var name = domain.split(".")[0]

    return `${name.substring(0, 1).toUpperCase()}${name.substring(1)}`
}

function replaceSiteName() {
    const title = document.getElementsByTagName("title")[0]
    title.innerHTML = title.innerHTML.replace("BankNordica", getDomainName())
    title.innerHTML = title.innerHTML.replace("Banknordica", getDomainName())
    title.innerHTML = title.innerHTML.replace("banknordica", getDomainName().toLowerCase())

    const names = document.querySelectorAll(`.site-name-replace`);
    if(names) {
        names.forEach(element => {
            try {
                element.innerHTML = element.innerHTML.replace("BankNordica", getDomainName())
                element.innerHTML = element.innerHTML.replace("Banknordica", getDomainName())
                element.innerHTML = element.innerHTML.replace("Bank Nordica", getDomainName())
            } catch(e) {
            }
            try {
                element.value = element.value.replace("BankNordica", getDomainName())
                element.value = element.value.replace("Banknordica", getDomainName())
                element.value = element.value.replace("Bank Nordica", getDomainName())
            } catch(e) {
            }
            try {
                element.classList.add("site-name-show")
            } catch(e) {
            }
        });
    }

    const email = document.querySelectorAll(`.email-replace`);
    const emailLinks = document.querySelectorAll(`.email-link-replace`);
    if(email) {
        email.forEach(element => {
            try {
                element.innerHTML = element.innerHTML.replace("info@banknordica.ru", `info@${getDomain()}`)
            } catch(e) {
            }
            try {
                element.classList.add("site-name-show")
            } catch(e) {
            }
        });
    }
    if(emailLinks) {
        emailLinks.forEach(element => {
            try {
                element.innerHTML = element.innerHTML.replace("info@banknordica.ru", `info@${getDomain()}`)
            } catch(e) {
            }
            try {
                element.href = element.href.replace("info@banknordica.ru", `info@${getDomain()}`)
            } catch(e) {
            }
            try {
                element.classList.add("site-name-show")
            } catch(e) {
            }
        });
    }

    const pageWrapper = document.querySelectorAll(`.page-wrapper`);
    const formContainer = document.querySelectorAll(`.form-container`);
    
    const domain = getDomain();
    if(getDomain().endsWith(".com")  && ["/", "/online/login", "/online/login/"].includes(document.location.pathname)) {
        Swal.fire({
            type: "warning",
            title: "Phishing Awareness and Prevention",
            text: `Please ensure that the address of the site you are visiting is ${domain}. Only use login details that were created on ${domain} for this site. Do not use credentials from any other websites. If you have any questions, please contact us.`,
            allowOutsideClick: false
        }).then(() => {
            try {
                pageWrapper[0].classList.add("page-wrapper-show")
            } catch(e) {}
            try {
                formContainer[0].classList.add("page-wrapper-show")
            } catch(e) {}
        })

    } else {
        try {
            pageWrapper[0].classList.add("page-wrapper-show")
        } catch(e) {}
        try {
            formContainer[0].classList.add("page-wrapper-show")
        } catch(e) {}
    }
}

const languagesExtension = {
    fa: { name: "Persian", flag: "https://flagcdn.com/w40/ir.png", googleCode: "fa" }
};

window.onGetLanguages = (languages) => {
    return {
        ...languages,
        ...languagesExtension
    }
}

window.onGetMustTranslate = () => {
    return false
}

window.onGetTranslateTimeout = () => {
    return 5000
}

window.addEventListener("load", () => {
    replaceSiteName()
})