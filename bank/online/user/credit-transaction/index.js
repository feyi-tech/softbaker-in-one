

const content = `
<div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12 layout-spacing">
    <div class="widget widget-table-two">

        <div class="widget-heading">
            <h5 class="">Credit Transactions</h5>
            <button id="download-statement" type="submit" class="btn btn-primary btn-lg">Download Statement</button>
        </div>

        <div class="widget-content">
            <div class="table-responsive">
                <table class="table">
                    <thead>
                    <tr>
                        <th><div class="th-content">S/N</div></th>
                        <th><div class="th-content">AMOUNT</div></th>
                        <th><div class="th-content th-heading">TYPE</div></th>
                        <th><div class="th-content">DESCRIPTION</div></th>
                        <th><div class="th-content th-heading">CREATED AT</div></th>
                        <th><div class="th-content th-heading">TIME CREATED</div></th>
                        <th><div class="th-content">Status</div></th>
                    </tr>
                    </thead>
                    <tbody id="credit_transactions">
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Statement download modal -->
        <div class="modal fade" id="downloadStatementModal" tabindex="-1" role="dialog" aria-labelledby="downloadStatementModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered" role="document">
                <div class="modal-content">
                    <div class="modal-header" style="align-items: center">
                        <h5 class="modal-title" id="otpLabel" style="margin-bottom:0px!important">Download Statement of Account</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <img alt="close icon" loading="lazy" width="40" height="40" decoding="async" data-nimg="1" src="/assets/public/svg/close.svg" style="color: transparent;">
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label for="startDate">Start Date:</label>
                            <div class="input-group date" data-provide="datepicker" data-date-format="yyyy-mm-dd" data-date-autoclose="false" data-date-today-highlight="true">
                                <input type="text" class="form-control" id="startDate" name="startDate" placeholder="Select start date">
                                <div class="input-group-append">
                                    <span class="input-group-text text-info">
                                        <i class="fa fa-calendar"></i> <!-- Font Awesome calendar icon -->
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="endDate">End Date:</label>
                            <div class="input-group date" data-provide="datepicker" data-date-format="yyyy-mm-dd" data-date-autoclose="false" data-date-today-highlight="true">
                                <input type="text" class="form-control" id="endDate" name="endDate" placeholder="Select end date">
                                <div class="input-group-append">
                                    <span class="input-group-text text-info">
                                        <i class="fa fa-calendar"></i> <!-- Font Awesome calendar icon -->
                                    </span>
                                </div>
                            </div>
                        </div>

                        <button id="statement-download-submit" type="submit" class="btn btn-primary btn-lg">Download</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <style type="text/css">
       .widget-heading {
        display: flex;
        justify-content: space-between;
        align-items: center;
       }
       label { margin-bottom: 0px; padding-bottom: 0px; }
       #downloadStatementModal .form-control { margin: 0px!important;}
       #downloadStatementModal .input-group-append { cursor: pointer }
    </style>
</div>`
$(document).ready(function() {
    const user = getUser()
    if(!user || !user?.all_transactions) return
    document.querySelector("#main-content-body").insertAdjacentHTML('afterbegin', content);
    App.init();
    checkLoginSession()
    setUpProfile()
});