

const content = `
<div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12 layout-spacing">
    <div class="widget widget-table-two">

        <div class="widget-heading">
            <h5 class="">Cards</h5>
        </div>

        <div class="widget-content">
            <div class="table-responsive">
                <table class="table cards-table">
                    <thead>
                    <tr>
                        <th><div class="th-content">S/N</div></th>
                        <th><div class="th-content">Card Alias</div></th>
                        <th><div class="th-content">Card Info</div></th>
                        <th><div class="th-content th-heading">Balance</div></th>
                        <th><div class="th-content th-heading">Cashback</div></th>
                        <th><div class="th-content">Type</div></th>
                    </tr>
                    </thead>
                    <tbody id="cards_list">
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

        <!-- CardAuthenticationModal OTP -->
        <div class="modal fade" id="cardAuthenticationModal" tabindex="-1" role="dialog" aria-labelledby="cardAuthenticationModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered" role="document">
                <div class="modal-content">
                    <div class="modal-header" style="align-items: center">
                        <h5 class="modal-title" id="otpLabel" style="margin-bottom:0px!important">Enter the last 10 digits of the card</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <img alt="close icon" loading="lazy" width="40" height="40" decoding="async" data-nimg="1" src="/assets/public/svg/close.svg" style="color: transparent;">
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label for="otp">Last 10 digits:</label>
                            <input type="text" class="form-control" id="card-digits" name="otp" placeholder="Enter the last 10 digits of the card.">
                        </div>
                        <button id="view-card-submit" type="submit" class="btn btn-primary btn-lg">View Card</button>
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
        
        #cards_list tr:nth-child(4n), #cards_list tr:nth-child(4n-1) {
            background-color: #f0f0f0; /* Set background color for every 2nd and 3rd tr */
        }
        .widget-table-two .table.cards-table {
            border-collapse: collapse;
            border-spacing: 0 0px;
        }  
        .widget-table-two .table.cards-table td {
            border-radius: 0px !important;
        }      
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