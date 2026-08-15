const content = `<div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12 layout-spacing" style="height: 100vh;"></div>`
$(document).ready(function() {
    document.querySelector("#main-content-body").insertAdjacentHTML('afterbegin', content);
    App.init();
    const user = getUser()
    if(!user) return
    checkLoginSession()
    setUpProfile()
    copyright()
});