const content = `<div class="account-content">
<div class="scrollspy-example" data-spy="scroll" data-target="#account-settings-scroll" data-offset="-100">
    <div class="row">
        <div class="col-xl-12 col-lg-12 col-md-12 layout-spacing">
            <form id="general-info" class="section general-info" enctype="multipart/form-data" method="POST">

                <div class="info">
                    <h6 class="">General Information</h6>
                    <div class="row">
                        <div class="col-lg-11 mx-auto">
                            <div class="row">
                                <div class="col-xl-2 col-lg-12 col-md-4 text-center">
                                    <div class="upload mt-4 pr-md-4">
                                       <center>
                                           <div class="dropify-wrapper has-preview">
                                            <div class="dropify-message">
                                                <span class="file-icon"></span> 
                                                <p>Click to Upload or Drag n Drop</p><p class="dropify-error">Ooops, something wrong appended.</p>
                                            </div>
                                            <div class="dropify-loader" style="display: none;"></div>
                                            <div class="dropify-errors-container">
                                                <ul></ul>
                                            </div>
                                            <input type="file" id="input-file-max-fs" class="dropify" data-default-file="" name="image" data-max-file-size="2M">
                                            <button type="button" class="dropify-clear">
                                                <i class="flaticon-close-fill"></i>
                                            </button>
                                            <div class="dropify-preview" style="display: block;">
                                                <span class="dropify-render">
                                                    <img src="/assets/auth/images/no-profile-photo.png">
                                                </span>
                                                <div class="dropify-infos">
                                                    <div class="dropify-infos-inner">
                                                        <p class="dropify-filename">
                                                            <span class="file-icon"></span> 
                                                            <span class="dropify-filename-inner"></span>
                                                        </p>
                                                        <p class="dropify-infos-message">Upload or Drag n Drop</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                       </center>
                                        <p class="mt-2"><i class="flaticon-cloud-upload mr-1"></i> Upload Picture</p>
                                        <div class="form-group text-center">
                                            <button class="btn btn-primary " name="upload_picture">Save</button>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-xl-10 col-lg-12 col-md-8 mt-md-0 mt-4">
                                    <div class="form">
                                        <div class="row">
                                            <div class="col-sm-6">
                                                <div class="form-group">
                                                    <label for="fullName">Account No</label>
                                                    <input type="text" class="form-control mb-4 account-number" id="fullName" placeholder="Full Name" value="" readonly="">
                                                </div>
                                            </div>
                                            <div class="col-sm-6">
                                                <div class="form-group">
                                                    <label for="profession">Account Type</label>
                                                    <input type="text" class="form-control mb-4 account-type" id="profession" placeholder="" value="" readonly="">
                                                </div>
                                            </div>
                                        </div>

                                        <div class="row">
                                            <div class="col-sm-6">
                                                <div class="form-group">
                                                    <label for="fullName">Email</label>
                                                    <input type="text" class="form-control mb-4 account-email" id="fullName" placeholder="Full Name" value="" readonly="">
                                                </div>
                                            </div>
                                            <div class="col-sm-6">
                                                <div class="form-group">
                                                    <label for="profession">Date Of Birth</label>
                                                    <input type="text" class="form-control mb-4 account-dob" id="profession" placeholder="Date Of Birth" value="" readonly="">
                                                </div>
                                            </div>
                                        </div>

                                        <div class="row">
                                            <div class="col-sm-6">
                                                <div class="form-group">
                                                    <label for="fullName">Occupation</label>
                                                    <input type="text" class="form-control mb-4 account-occupation" placeholder="Ocuppation" value="" readonly="">
                                                </div>
                                            </div>
                                            <div class="col-sm-6">
                                                <div class="form-group">
                                                    <label for="profession">Phone Number</label>
                                                    <input type="text" class="form-control mb-4 account-phone" id="profession" placeholder="Date Of Birth" value="" readonly="">
                                                </div>
                                            </div>
                                        </div>

                                        <div class="row">
                                            <div class="col-sm-6">
                                                <div class="form-group">
                                                    <label for="fullName">Gender</label>
                                                    <input type="text" class="form-control mb-4 text-capitalize account-gender" placeholder="" value="female" readonly="">
                                                </div>
                                            </div>
                                            <div class="col-sm-6">
                                                <div class="form-group">
                                                    <label for="profession">Marital Status</label>
                                                    <input type="text" class="form-control mb-4 text-capitalize account-marital-status" id="profession" placeholder="Date Of Birth" value="" readonly="">
                                                </div>
                                            </div>



                                        </div>



                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>

    <div class="col-xl-12 col-lg-12 col-md-12 layout-spacing">
        <form class="section about">
            <div class="info">
                <h5 class="">Contact Information</h5>
                <div class="row">
                    <div class="col-md-11 mx-auto">
                        <div class="form-group">
                            <label>Contact Address</label>
                            <input type="text" class="form-control mb-4 account-address notranslate" name="acct_address" placeholder="Designer" value="" readonly="">
                        </div>
                    </div>
                </div>

            </div>
        </form>
    </div>

    <div class="col-xl-6 col-lg-6 col-md-6 layout-spacing">
        <form class="section about" method="post">
            <div class="info">
                <h5 class="">Change Password</h5>
                <div class="row">
                    <div class="col-md-11 mx-auto">
                        <div class="form-group">
                            <label>Old Password</label>
                            <input type="password" class="form-control mb-4" name="old_password" placeholder="Old Password" value="">
                        </div>
                        <div class="form-group">
                                <label>New Password</label>
                            <input type="password" class="form-control mb-4" name="new_password" placeholder="New Password" value="">
                        </div>

                        <div class="form-group">
                            <label>Confirm Password</label>
                            <input type="password" class="form-control mb-4" name="confirm_password" placeholder="Confirm Password">
                        </div>

                        <div class="form-group">
                            <button class="btn btn-primary" name="change_password">Change Password</button>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    </div>
    <div class="col-xl-6 col-lg-6 col-md-6 layout-spacing">
            <form class="section about" method="post" autocomplete="off" autofocus="off">
                <div class="info">
                    <h5 class="">Change Pin</h5>
                    <div class="row">
                        <div class="col-md-11 mx-auto">
                            <div class="form-group">
                                <label>Current Pin</label>
                                <input type="password" class="form-control mb-4" name="current_pin" placeholder="Current Pin" value="">
                            </div>
                            <div class="form-group">
                                <label>New Pin</label>
                                <input type="password" class="form-control mb-4" name="new_pin" placeholder="New Pin" value="">
                            </div>

                            <div class="form-group">
                                <label>Confirm Pin</label>
                                <input type="password" class="form-control mb-4" name="confirm_pin" placeholder="Confirm Pin">
                            </div>
                            <div class="form-group">
                                <button class="btn btn-primary" name="change_pin">Change Pin</button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>


    </div>
</div>
</div>`
$(document).ready(function() {
    document.querySelector("#main-content-body").insertAdjacentHTML('afterbegin', content);
    App.init();
    const user = getUser()
    if(!user) return
    checkLoginSession()
    setUpProfile()
    copyright()
});