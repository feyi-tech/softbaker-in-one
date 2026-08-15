
const content = (user) => `

<!--<div class="col-xl-4 col-lg-4 col-md-4 col-sm-12 col-4 layout-spacing layout-visible">-->
<div class="col-xl-6 col-lg-6 col-md-12 col-sm-12 col-12 layout-spacing layout-visible">
    <div class="widget widget-three">
        <div class="widget-heading">
            <h5 class="">Quarterly Summary</h5>


            <div class="task-action d-none">
                <div class="dropdown">
                    <a class="dropdown-toggle" href="index.html#" role="button" id="pendingTask" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-more-horizontal"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                    </a>

                    <div class="dropdown-menu dropdown-menu-right" aria-labelledby="pendingTask" style="will-change: transform;">
                        <a class="dropdown-item" href="javascript:void(0);">View Report</a>
                        <a class="dropdown-item" href="javascript:void(0);">Edit Report</a>
                        <a class="dropdown-item" href="javascript:void(0);">Mark as Done</a>
                    </div>
                </div>
            </div>

        </div>
        <div class="widget-content">

            <div class="order-summary">

                <div class="summary-list">
                    <div class="w-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-shopping-bag"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                    </div>
                    <div class="w-summary-details">

                        <div class="w-summary-info">
                            <h6>Income</h6>
                            <p class="summary-count"><span class="w-currency"></span><span class="account-credits"></span></p>
                        </div>

                        <div class="w-summary-stats">
                            <div class="progress">
                                <div class="progress-bar bg-gradient-secondary" role="progressbar" style="width: 100%" aria-valuenow="90" aria-valuemin="0" aria-valuemax="100"></div>
                            </div>
                        </div>

                    </div>

                </div>

                <div class="summary-list">
                    <div class="w-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-tag"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7" y2="7"></line></svg>
                    </div>
                    <div class="w-summary-details">

                        <div class="w-summary-info">
                            <h6>Loan Balance</h6>
                            <p class="summary-count"><span class="w-currency"></span><span class="account-loans"></span></p>
                        </div>

                        <div class="w-summary-stats">
                            <div class="progress">
                                <div class="progress-bar bg-gradient-success" role="progressbar" style="width: 100%" aria-valuenow="65" aria-valuemin="0" aria-valuemax="100"></div>
                            </div>
                        </div>

                    </div>

                </div>

                <div class="summary-list">
                    <div class="w-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-credit-card"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                    </div>
                    <div class="w-summary-details">

                        <div class="w-summary-info">
                            <h6>Expenses</h6>
                            <p class="summary-count"><span class="w-currency"></span><span class="account-debits"></span></p>
                        </div>

                        <div class="w-summary-stats">
                            <div class="progress">
                                <div class="progress-bar bg-gradient-warning" role="progressbar" style="width: 100%" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100"></div>
                            </div>
                        </div>

                    </div>

                </div>

            </div>

        </div>
    </div>
</div>

<div class="d-none col-xl-6 col-lg-6 col-md-6 col-sm-12 col-6 layout-spacing layout-visible">
    <div class="widget-two">
        <div class="widget-content">
            <div class="w-numeric-value">
                <div class="w-content">
                    <span class="w-value">Daily Stats</span>
                    <span class="w-numeric-title d-none"><a class="text-primary" href="/online/user/deposit-transaction">Go to Transaction for details.</a></span>
                </div>
                <div class="w-icon" style="display:flex;padding:0px;justify-content:center;align-items:center">
                    <div class="w-currency" style="width: auto; height: auto;"></div>
                </div>
            </div>
            <div class="w-chart">
                <div id="daily-sales" style="min-height: 175px;">
                </div>
            <div class="resize-triggers">
                <div class="expand-trigger">
                    <div style="width: 569px; height: 176px;"></div></div><div class="contract-trigger"></div></div></div>
        </div>
    </div>
</div>

<div class="col-xl-6 col-lg-6 col-md-12 col-sm-12 col-12 layout-spacing">

    <div class="widget widget-account-invoice-three">

        <div class="widget-heading">
            <div class="wallet-usr-info">
                <div class="usr-name">
                    <span><img src="/assets/auth/images/no-profile-photo.png" alt="admin-profile" class="img-fluid"> <span class="account-name notranslate">loading name</span></span>
                </div>
                <div class="add">
                    <span><a data-toggle="modal" data-target="#exampleModal"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-plus text-white"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg></a></span>
                </div>
            </div>
            <div class="wallet-balance">
                <p>Balance</p>
                <h5 class="">
                    <span class="w-currency"></span>
                    <span class="account-balance"></span>
                </h5>
            </div>
            <div class="account-watermark d-none"></div>
        </div>

        <div class="widget-amount">

            <div class="w-a-info funds-received">
                <span>Deposit <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-chevron-down"><polyline points="6 9 12 15 18 9"></polyline></svg></span>


                <p>
                    <a class="btn btn-success btn-sm col-12" data-toggle="modal" data-target="#exampleModal">Deposit</a>
                </p>
            </div>

            <div class="w-a-info funds-spent">
                <span>Transfer <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-chevron-up"><polyline points="18 15 12 9 6 15"></polyline></svg></span>
                <p>
                    <a id="transferButton" class="btn btn-primary btn-sm col-12">Transfer </a>

                </p>
            </div>
        </div>

        <div class="widget-content">

            <div class="bills-stats; text-center">
                <button id="account-on-hold" class="btn btn-large btn-danger btn-sm on-hold-button">Account on Hold</button>                        </div>

            <div class="invoice-list">

                <div class="inv-detail">
                    <div class="info-detail-1">
                        <p>Credits</p>
                        <p><span class="w-currency"></span> <span class="account-credits">50005000</span></p>
                    </div>
                    <div class="info-detail-2">
                        <p>Debits</p>
                        <p class=""><span class="w-currency text-danger"></span> <span class="bill-amount text-danger account-debits">49062774 </span></p>
                    </div>
                </div>

                <div class="inv-action d-none">
                    <a href="/online/user/deposit-transaction" class="btn btn-outline-primary view-details">View Transactions</a>
                    <a href="/online/user/wire-transfer" class="btn btn-outline-primary pay-now">Wire Transfer</a>
                </div>
            </div>
        </div>

    </div>
</div>

<div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12 layout-spacing ">
    <div class="widget widget-table-two">

        <div class="recent-transactions widget-heading">
            <h5 class="">Recent Transactions</h5>
            <button id="download-statement" type="submit" class="btn btn-primary btn-lg">Download Statement</button>
        </div>

        <div class="widget-content">
            <div class="table-responsive">
                <table class="table">
                    <thead>
                    <tr>
                        <th><div class="th-content">S/N</div></th>
                        <!--                                    <th><div class="th-content">NAME</div></th>-->
                        <th><div class="th-content">AMOUNT</div></th>
                        <th><div class="th-content th-heading">TYPE</div></th>
                        <th><div class="th-content">DESCRIPTION</div></th>
                        <th><div class="th-content th-heading">CREATED AT</div></th>
                        <th><div class="th-content th-heading">TIME CREATED</div></th>
                        <th><div class="th-content">Status</div></th>
                    </tr>
                    </thead>
                    <tbody id="all_transactions">
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- Modal -->
        <div class="modal fade" id="exampleModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header" style="align-items: center">
                        <h5 class="modal-title" id="exampleModalLabel" style="margin-bottom:0px!important">Share Account Details</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <img alt="close icon" loading="lazy" width="40" height="40" decoding="async" data-nimg="1" src="/assets/public/svg/close.svg" style="color: transparent;">
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="deposit-info">
                            <div>
                                <div>Routing Number:</div>
                                <div>873100040</div>
                            </div>
                            <div>
                                <div>Account Number:</div>
                                <div class="account-number"></div>
                            </div>
                            <div>
                                <div>Account Holder:</div>
                                <div class="account-name notranslate"></div>
                            </div>
                            <div>
                                <div>Bank Name:</div>
                                <div class="site-name-replace-parent">&nbsp;<span class="site-name-replace notranslate">Banknordica</span>&nbsp;</div>
                            </div>
                            <div>
                                <div>Account Type:</div>
                                <div class="account-type"></div>
                            </div>
                            <div>
                                <div>Address:</div>
                                <div class="account-address notranslate"></div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button id="copy-deposit" class="btn" data-dismiss="modal"><i class="flaticon-cancel-12"></i>Copy</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Transfer Modal -->
        <div class="modal fade" id="transferModal" tabindex="-1" role="dialog" aria-labelledby="transferModalLabel" aria-hidden="true">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header" style="align-items: center">
                        <h5 class="modal-title" id="transferModalLabel" style="margin-bottom:0px!important">Transfer</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <img alt="close icon" loading="lazy" width="40" height="40" decoding="async" data-nimg="1" src="/assets/public/svg/close.svg" style="color: transparent;">
                        </button>
                    </div>
                    <div class="modal-body">
                        <!-- Nav tabs -->
                        <ul class="nav nav-tabs nav-justified" id="transferTabs" role="tablist">
                            <li class="nav-item">
                                <a class="nav-link active" id="localTransferTab" data-toggle="tab" href="#localTransfer" role="tab" aria-controls="localTransfer" aria-selected="true">
                                    <span>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-share"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>
                                        <span>Local Transfer</span>
                                    </span>
                                </a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" id="wireTransferTab" data-toggle="tab" href="#wireTransfer" role="tab" aria-controls="wireTransfer" aria-selected="false">
                                    <span>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-wifi"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>
                                        <span>Wire Transfer</span>
                                    </span>
                                </a>
                            </li>
                        </ul>

                        <!-- Tab panes -->
                        <div class="tab-content" id="transferTabContent">
                            <div class="tab-pane fade show active" id="localTransfer" role="tabpanel" aria-labelledby="localTransferTab">
                                <!-- Local bank transfer form -->
                                <form id="localTransferForm">
                                    <div class="form-group">
                                        <label for="localName">Recipient Name:</label>
                                        <input type="text" class="form-control" id="localName" name="localName" placeholder="Enter recipient fullname">
                                    </div>
                                    <div class="form-group">
                                        <label for="localAccount">Recipient Account Number:</label>
                                        <input type="text" class="form-control" id="localAccount" name="localAccount" placeholder="Enter the account number">
                                    </div>
                                    <div class="form-group">
                                        <label for="localAmount">Amount(<span class="w-currency"></span>):</label>
                                        <input type="text" class="form-control" id="localAmount" name="localAmount" placeholder="Enter amount">
                                    </div>
                                    <div class="form-group">
                                        <label for="localMemo">Memo(Optional):</label>
                                        <textarea class="form-control" id="localMemo" name="localMemo" placeholder="Enter memo"></textarea>
                                    </div>
                                    <button id="local-submit" type="submit" class="btn btn-primary btn-lg">Send</button>
                                </form>
                            </div>
                            <div class="tab-pane fade" id="wireTransfer" role="tabpanel" aria-labelledby="wireTransferTab">
                                <!-- Wire transfer form -->
                                <form id="wireTransferForm">
                                    <div class="form-group">
                                        <label for="wireName">Recipient Name:</label>
                                        <input type="text" class="form-control" id="wireName" name="wireName" placeholder="Enter recipient fullname">
                                    </div>
                                    <div class="form-group">
                                        <label for="wireBankName">Bank Name:</label>
                                        <input type="text" class="form-control" id="wireBankName" name="wireBankName" placeholder="Enter recipient bank name">
                                    </div>
                                    <div class="form-group">
                                        <label for="rNumber">Routing Number<br />(Only For USA and Canada recipients):</label>
                                        <input type="text" class="form-control" id="rNumber" name="rNumber" placeholder="Enter the routing number">
                                    </div>
                                    <div class="form-group">
                                        <label for="wireBankAccount1">Account Number<br />(Only For USA and Canada recipients):</label>
                                        <input type="text" class="form-control" id="wireBankAccount1" name="wireBankAccount1" placeholder="Enter the account number">
                                    </div>
                                    <div class="form-group">
                                        <label for="swiftBIC">Swift/BIC<br />(Only For European recipients):</label>
                                        <input type="text" class="form-control" id="swiftBIC" name="swiftBIC" placeholder="Enter Swift/BIC">
                                    </div>
                                    <div class="form-group">
                                        <label for="wireBankAccount">IBAN<br />(Only For European recipients):</label>
                                        <input type="text" class="form-control" id="wireBankAccount" name="wireBankAccount" placeholder="Enter the international bank account number">
                                    </div>
                                    <div class="form-group">
                                        <label for="wireAmount">Amount(<span class="w-currency"></span>):</label>
                                        <input type="text" class="form-control" id="wireAmount" name="wireAmount" placeholder="Enter amount">
                                    </div>
                                    <div class="form-group">
                                        <label for="wireMemo">Memo(Optional):</label>
                                        <textarea class="form-control" id="wireMemo" name="wireMemo" placeholder="Enter memo"></textarea>
                                    </div>
                                    <!-- Add more wire transfer fields as needed -->
                                    <button id="wire-submit" type="submit" class="btn btn-primary btn-lg">Send</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Transfer OTP -->
        <div class="modal fade" id="otpModal" tabindex="-1" role="dialog" aria-labelledby="otpModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered" role="document">
                <div class="modal-content">
                    <div class="modal-header" style="align-items: center">
                        <h5 class="modal-title" id="otpLabel" style="margin-bottom:0px!important">Confirm Transaction</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <img alt="close icon" loading="lazy" width="40" height="40" decoding="async" data-nimg="1" src="/assets/public/svg/close.svg" style="color: transparent;">
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label for="otp">OTP:</label>
                            <input type="text" class="form-control" id="otp" name="otp" placeholder="Enter the OTP sent to you">
                        </div>
                        <button id="otp-submit" type="submit" class="btn btn-primary btn-lg">Confirm</button>
                    </div>
                </div>
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
        .recent-transactions.widget-heading {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .tab-content { padding-top: 1rem; }
        label { margin-bottom: 0px; padding-bottom: 0px; }
        #downloadStatementModal .form-control { margin: 0px!important;}
        #downloadStatementModal .input-group-append { cursor: pointer }
    </style>
</div>
`

const chart = () => {
    try {

        /*
            ==============================
            |    @Options Charts Script   |
            ==============================
        */
        
        /*
            =============================
                Daily Sales | Options
            =============================
        */
            var d_2options1 = {
              chart: {
                    height: 160,
                    type: 'bar',
                    stacked: true,
                    stackType: '100%',
                    toolbar: {
                      show: false,
                    }
                },
                dataLabels: {
                    enabled: false,
                },
                stroke: {
                    show: true,
                    width: 1,
                },
                colors: ['#e2a03f', '#e0e6ed'],
                responsive: [{
                    breakpoint: 480,
                    options: {
                        legend: {
                            position: 'bottom',
                            offsetX: -10,
                            offsetY: 0
                        }
                    }
                }],
                series: [{
                    name: 'Sales',
                    data: [44, 55, 41, 67, 22, 43, 21]
                },{
                    name: 'Last Week',
                    data: [13, 23, 20, 8, 13, 27, 33]
                }],
                xaxis: {
                    labels: {
                        show: false,
                    },
                    categories: ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'],
                },
                yaxis: {
                    show: false
                },
                fill: {
                    opacity: 1
                },
                plotOptions: {
                    bar: {
                        horizontal: false,
                        columnWidth: '25%',
                        
                    }
                },
                legend: {
                    show: false,
                },
                grid: {
                    show: false,
                    xaxis: {
                        lines: {
                            show: false
                        }
                    },
                    padding: {
                      top: 10,
                      right: 0,
                      bottom: -40,
                      left: 0
                    }, 
                },
            }
        
        /*
            =============================
                Total Orders | Options
            =============================
        */ 
        var d_2options2 = {
          chart: {
            id: 'sparkline1',
            group: 'sparklines',
            type: 'area',
            height: 290,
            sparkline: {
              enabled: true
            },
          },
          stroke: {
              curve: 'smooth',
              width: 2
          },
          fill: {
            opacity: 1,
          },
          series: [{
            name: 'Sales',
            data: [28, 40, 36, 52, 38, 60, 38, 52, 36, 40]
          }],
          labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
          yaxis: {
            min: 0
          },
          grid: {
            padding: {
              top: 125,
              right: 0,
              bottom: 0,
              left: 0
            }, 
          },
          tooltip: {
            x: {
              show: false,
            },
            theme: 'dark'
          },
          colors: ['#1abc9c']
        }
      
        
        /*
            =================================
                Revenue Monthly | Options
            =================================
        */
        var options1 = {
          chart: {
            fontFamily: 'Nunito, sans-serif',
            height: 365,
            type: 'area',
            zoom: {
                enabled: false
            },
            dropShadow: {
              enabled: true,
              opacity: 0.2,
              blur: 10,
              left: -7,
              top: 22
            },
            toolbar: {
              show: false
            },
            events: {
              mounted: function(ctx, config) {
                const highest1 = ctx.getHighestValueInSeries(0);
                const highest2 = ctx.getHighestValueInSeries(1);
        
                ctx.addPointAnnotation({
                  x: new Date(ctx.w.globals.seriesX[0][ctx.w.globals.series[0].indexOf(highest1)]).getTime(),
                  y: highest1,
                  label: {
                    style: {
                      cssClass: 'd-none'
                    }
                  },
                  customSVG: {
                      SVG: '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="#1b55e2" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="feather feather-circle"><circle cx="12" cy="12" r="10"></circle></svg>',
                      cssClass: undefined,
                      offsetX: -8,
                      offsetY: 5
                  }
                })
        
                ctx.addPointAnnotation({
                  x: new Date(ctx.w.globals.seriesX[1][ctx.w.globals.series[1].indexOf(highest2)]).getTime(),
                  y: highest2,
                  label: {
                    style: {
                      cssClass: 'd-none'
                    }
                  },
                  customSVG: {
                      SVG: '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="#e7515a" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="feather feather-circle"><circle cx="12" cy="12" r="10"></circle></svg>',
                      cssClass: undefined,
                      offsetX: -8,
                      offsetY: 5
                  }
                })
              },
            }
          },
          colors: ['#1b55e2', '#e7515a'],
          dataLabels: {
              enabled: false
          },
          markers: {
            discrete: [{
            seriesIndex: 0,
            dataPointIndex: 7,
            fillColor: '#000',
            strokeColor: '#000',
            size: 5
          }, {
            seriesIndex: 2,
            dataPointIndex: 11,
            fillColor: '#000',
            strokeColor: '#000',
            size: 4
          }]
          },
          subtitle: {
            text: '$10,840',
            align: 'left',
            margin: 0,
            offsetX: 95,
            offsetY: 0,
            floating: false,
            style: {
              fontSize: '18px',
              color:  '#4361ee'
            }
          },
          title: {
            text: 'Total Profit',
            align: 'left',
            margin: 0,
            offsetX: -10,
            offsetY: 0,
            floating: false,
            style: {
              fontSize: '18px',
              color:  '#0e1726'
            },
          },
          stroke: {
              show: true,
              curve: 'smooth',
              width: 2,
              lineCap: 'square'
          },
          series: [{
              name: 'Income',
              data: [16800, 16800, 15500, 17800, 15500, 17000, 19000, 16000, 15000, 17000, 14000, 17000]
          }, {
              name: 'Expenses',
              data: [16500, 17500, 16200, 17300, 16000, 19500, 16000, 17000, 16000, 19000, 18000, 19000]
          }],
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          xaxis: {
            axisBorder: {
              show: false
            },
            axisTicks: {
              show: false
            },
            crosshairs: {
              show: true
            },
            labels: {
              offsetX: 0,
              offsetY: 5,
              style: {
                  fontSize: '12px',
                  fontFamily: 'Nunito, sans-serif',
                  cssClass: 'apexcharts-xaxis-title',
              },
            }
          },
          yaxis: {
            labels: {
              formatter: function(value, index) {
                return (value / 1000) + 'K'
              },
              offsetX: -22,
              offsetY: 0,
              style: {
                  fontSize: '12px',
                  fontFamily: 'Nunito, sans-serif',
                  cssClass: 'apexcharts-yaxis-title',
              },
            }
          },
          grid: {
            borderColor: '#e0e6ed',
            strokeDashArray: 5,
            xaxis: {
                lines: {
                    show: true
                }
            },   
            yaxis: {
                lines: {
                    show: false,
                }
            },
            padding: {
              top: 0,
              right: 0,
              bottom: 0,
              left: -10
            }, 
          }, 
          legend: {
            position: 'top',
            horizontalAlign: 'right',
            offsetY: -50,
            fontSize: '16px',
            fontFamily: 'Nunito, sans-serif',
            markers: {
              width: 10,
              height: 10,
              strokeWidth: 0,
              strokeColor: '#fff',
              fillColors: undefined,
              radius: 12,
              onClick: undefined,
              offsetX: 0,
              offsetY: 0
            },    
            itemMargin: {
              horizontal: 0,
              vertical: 20
            }
          },
          tooltip: {
            theme: 'dark',
            marker: {
              show: true,
            },
            x: {
              show: false,
            }
          },
          fill: {
              type:"gradient",
              gradient: {
                  type: "vertical",
                  shadeIntensity: 1,
                  inverseColors: !1,
                  opacityFrom: .28,
                  opacityTo: .05,
                  stops: [45, 100]
              }
          },
          responsive: [{
            breakpoint: 575,
            options: {
              legend: {
                  offsetY: -30,
              },
            },
          }]
        }
        
        /*
            ==================================
                Sales By Category | Options
            ==================================
        */
      
        var options = {
              chart: {
                  type: 'donut',
                  width: 380
              },
              colors: ['#5c1ac3', '#e2a03f', '#e7515a', '#e2a03f'],
              dataLabels: {
                enabled: false
              },
              legend: {
                  position: 'bottom',
                  horizontalAlign: 'center',
                  fontSize: '14px',
                  markers: {
                    width: 10,
                    height: 10,
                  },
                  itemMargin: {
                    horizontal: 0,
                    vertical: 8
                  }
              },
              plotOptions: {
                pie: {
                  donut: {
                    size: '65%',
                    background: 'transparent',
                    labels: {
                      show: true,
                      name: {
                        show: true,
                        fontSize: '29px',
                        fontFamily: 'Nunito, sans-serif',
                        color: undefined,
                        offsetY: -10
                      },
                      value: {
                        show: true,
                        fontSize: '26px',
                        fontFamily: 'Nunito, sans-serif',
                        color: '20',
                        offsetY: 16,
                        formatter: function (val) {
                          return val
                        }
                      },
                      total: {
                        show: true,
                        showAlways: true,
                        label: 'Total',
                        color: '#888ea8',
                        formatter: function (w) {
                          return w.globals.seriesTotals.reduce( function(a, b) {
                            return a + b
                          }, 0)
                        }
                      }
                    }
                  }
                }
              },
              stroke: {
                show: true,
                width: 25,
              },
              series: [985, 737, 270],
              labels: ['Apparel', 'Sports', 'Others'],
              responsive: [{
                  breakpoint: 1599,
                  options: {
                      chart: {
                          width: '350px',
                          height: '400px'
                      },
                      legend: {
                          position: 'bottom'
                      }
                  },
          
                  breakpoint: 1439,
                  options: {
                      chart: {
                          width: '250px',
                          height: '390px'
                      },
                      legend: {
                          position: 'bottom'
                      },
                      plotOptions: {
                        pie: {
                          donut: {
                            size: '65%',
                          }
                        }
                      }
                  },
              }]
        }
        
        /*
            ==============================
            |    @Render Charts Script    |
            ==============================
        */
        
        
        /*
            ============================
                Daily Sales | Render
            ============================
        */
          var d_2C_1 = new ApexCharts(document.querySelector("#daily-sales"), d_2options1);
          d_2C_1.render();
        
        /*
            ============================
                Total Orders | Render
            ============================
        
        var d_2C_2 = new ApexCharts(document.querySelector("#total-orders"), d_2options2);
        d_2C_2.render();*/
        
        /*
            ================================
                Revenue Monthly | Render
            ================================
        
        var chart1 = new ApexCharts(
            document.querySelector("#revenueMonthly"),
            options1
        );
        
        chart1.render();*/
        
        /*
            =================================
                Sales By Category | Render
            =================================
        
        var chart = new ApexCharts(
            document.querySelector("#chart-2"),
            options
        );
        
        chart.render();*/
        
        /*
            =============================================
                Perfect Scrollbar | Recent Activities
            =============================================
        */
       $('.mt-container').each(function(){ const ps = new PerfectScrollbar($(this)[0]); });
        /*
        const topSellingProduct = new PerfectScrollbar('.widget-table-three .table-scroll table', {
          wheelSpeed:.5,
          swipeEasing:!0,
          minScrollbarLength:40,
          maxScrollbarLength:100,
          suppressScrollY: true
        
        });*/
        
        } catch(e) {
          //console.log(e);
        }
}

const copyFromTextFallBack = (text, onCopy, onError) => {
    var textArea = document.createElement("textarea");
    textArea.value = text;
    
    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    textArea.id = "copyFromTextFallBack"

    document.body.appendChild(textArea);
    // Delay to give the browser time to render the textarea
    setTimeout(() => {
        textArea.focus();
        textArea.select();

        try {
            var successful = document.execCommand('copy');
            var msg = successful ? 'successful' : 'unsuccessful';
            console.log('Fallback: Copying text command was ' + msg);
            if(onCopy) {
                onCopy()
            }
        } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
            if(onError) {
                onCopy(err)
            }
        }

        // Remove the textarea from the document body
        document.body.removeChild(textArea);
    }, 50); // Adjust delay as needed
}

const copyFromText = (text, onCopy, onError) => {
    console.log("copyFromText: ", navigator.clipboard)
    if (!navigator.clipboard) {
        copyFromTextFallBack(text, onCopy, onError);
        return;
    }
    navigator.clipboard.writeText(text)
    .then( () => {
        console.log('Async: Copying to clipboard was successful!')
        if(onCopy) onCopy()
    })
    .catch(e => {
        console.error('Async: Could not copy text: ', e)
        if(onError) onError(e)
    })
}

function getCurrentHourTimestamp() {
    // Create a new Date object for the current date and time
    let now = new Date();

    // Set minutes, seconds, and milliseconds to zero to get the start of the current hour
    now.setMinutes(5);
    now.setSeconds(0);
    now.setMilliseconds(0);

    // Return the timestamp at the start of the current hour
    return now.getTime(); // Returns milliseconds since January 1, 1970
}

function getCurrentTimestampAtInterval(minutes) {
    return new Promise((resolve) => {
        // Get the current UTC time
        let now = new Date();
    
        // Use UTC minutes to calculate the nearest interval
        let currentMinute = now.getUTCMinutes();
        let nearestInterval = Math.floor(currentMinute / minutes) * minutes;
    
        // Set the UTC minutes, seconds, and milliseconds to the start of the interval
        now.setUTCMinutes(nearestInterval);
        now.setUTCSeconds(0);
        now.setUTCMilliseconds(0);
    
        // Resolve the promise with the UTC timestamp
        resolve(now.getTime());
    });
}

function hashTexts(texts) {
    //console.log("hashTexts: ", texts)
    // Join the texts together in lower case and remove punctuations and spaces
    let joinedText = texts.join('').toLowerCase().replace(/[^\w]/g, '').trim();
    //console.log("hashTexts.joinedText: ", joinedText)
  
    // Hash the joined text using SHA-256 from crypto-js
    let hashedText = sha256(joinedText).toString();
  
    // Convert the hash to numbers
    let hashAsInt = parseInt(hashedText, 16);
  
    // Take the last 6 digits of the hash
    let lastSixDigits = `${hashAsInt % 1000000}`;
    if(lastSixDigits.length < 6) lastSixDigits += '4'.repeat(6 - lastSixDigits.length)
  
    return lastSixDigits;
}

var txDetails = null

function send(tx, btn) {
    btn.innerText = "Please wait..."
    btn.setAttribute("style", "font-style: italic;opacity: 0.4;cursor:not-allowed")
    txDetails = tx
    setTimeout(() => {
        btn.innerText = "Send"
        btn.setAttribute("style", "")
        $('#transferModal').modal('hide');
        $('#otpModal').modal('show');
    }, getRandomRangeNoSeed(1000, 3000));
}

$(document).ready(function() {
    var user = getUser()
    if(!user || !user?.all_transactions) return
    //setUser()
    document.querySelector("#main-content-body").insertAdjacentHTML('afterbegin', content(user));
    chart()
    App.init();
    checkLoginSession()
    setUpProfile()
    try {
        //document.querySelector("body").insertAdjacentHTML('afterbegin', loader);
        setTimeout(() => {
            const loadScreen = document.querySelector(`#load_screen`);
            //console.log("loadScreen: ", loadScreen)
            loadScreen.classList.add("d-none");
            Snackbar.show({
                text: `Welcome Back ${user.fullname} !`,
                actionTextColor: "#fff",
                backgroundColor: "#1abc9c",
                pos: "top-right",
                duration: "3000",
                actionText: "Close"
            });
        }, getRandomRangeNoSeed(1000, 3000));
    
    } catch(e) {
        //console.log("loader-error: ", e.message)
    }
    
    const accountDetails = `Routing Number: 873100040
Account Number: ${user.accountNumber_username}
Account Holder: ${user.fullname}
Bank Name: Bank Nordica, N.A.
Account Type: ${user.accountType? user.accountType.substring(0, 1).toUpperCase() + user.accountType.substring(1) : ""}
Address: ${user.address}`
    document.querySelector("#copy-deposit").addEventListener("click", () => {
        copyFromText(accountDetails, () => {
            Swal.fire({
                type: "success",
                title: "Account Details",
                text: "Account details successfully copied."
            })
        }, () => {
            Swal.fire({
                type: "error",
                title: "Account Details",
                text: "Failed to copy account details. Please contact us."
            })
        })
        
    })

    // Get the local and wire transfer forms
    var localTransferForm = document.getElementById('localTransferForm');
    var wireTransferForm = document.getElementById('wireTransferForm');

    var localTransferFormButton = document.getElementById('local-submit');
    var wireTransferFormButton = document.getElementById('wire-submit');

    // Attach event listener to the submit button of local transfer form
    localTransferForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent form submission
        if(localTransferFormButton.innerText.includes("...")) return
        user = getUser()

        // Perform validation
        var localName = document.getElementById('localName').value;
        var localAccount = document.getElementById('localAccount').value;
        var localAmount = document.getElementById('localAmount').value;

        if (!localName || !localAccount || !localAmount) {
            Swal.fire({
                type: "error",
                title: "Transfer Error",
                text: "Please enter all non-optional fields."
            });
            return;
        }

        if (isNaN(localAmount) || localAmount < 1) {
            Swal.fire({
                type: "error",
                title: "Transfer Error",
                text: "Invalid amount."
            });
            return;
        }

        const debit = {
            amount: parseInt(localAmount)
        }
        
        if(getAccountBalance(user) - debit.amount < 0) {
            Swal.fire({
                type: "error",
                title: "Transfer Error",
                text: "Insufficient balance."
            });
            return;
        }

        // If all validations pass, create an object with form data
        var localFormData = {
            type: 'local',
            name: localName,
            accountNumber: localAccount,
            amount: localAmount,
            memo: document.getElementById('localMemo').value
        };

        send(localFormData, localTransferFormButton);
        // You can further process the localFormData object here
    });

    // Attach event listener to the submit button of wire transfer form
    wireTransferForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent form submission
        if(wireTransferFormButton.innerText.includes("...")) return
        user = getUser()

        // Perform validation
        var wireName = document.getElementById('wireName').value;
        var wireBankName = document.getElementById('wireBankName').value;
        var swiftBIC = document.getElementById('swiftBIC').value;
        var wireBankAccount = document.getElementById('wireBankAccount').value;
        var wireAmount = document.getElementById('wireAmount').value;
        var rNumber = document.getElementById('rNumber').value;
        var wireBankAccount1 = document.getElementById('wireBankAccount1').value;

        var emptyAcc = (
            (!swiftBIC || !wireBankAccount) && 
            (!rNumber || !wireBankAccount1)
        )

        if (!wireName || !wireBankName || emptyAcc || !wireAmount) {
            var detailedError = emptyAcc? "If you're sending to a recipient in USA or Canada, make sure you provide the routing number and the account number. If you're sending to a recipient in Europe or any country using the IBAN system, make sure you provide the Swift/BIC and the IBAN." : ""
            Swal.fire({
                type: "error",
                title: "Transfer Error",
                text: `Please enter all non-optional fields. ${detailedError}`
            });
            return;
        }

        if (isNaN(wireAmount) || wireAmount < 1) {
            Swal.fire({
                type: "error",
                title: "Transfer Error",
                text: "Invalid amount."
            });
            return;
        }

        const debit = {
            amount: parseInt(wireAmount)
        }
        
        //console.log("debitsInfo: ", debitsInfo, debit, " | ", user.accountBalance - debitsInfo.total)
        if(getAccountBalance(user) - debit.amount < 0) {
            Swal.fire({
                type: "error",
                title: "Transfer Error",
                text: "Insufficient balance."
            });
            return;
        }
        

        // If all validations pass, create an object with form data
        var wireFormData = {
            type: 'wire',
            name: wireName,
            bankName: wireBankName,
            swiftBIC: swiftBIC,
            accountNumber: wireBankAccount,
            amount: wireAmount,
            memo: document.getElementById('wireMemo').value,
            rNumber,
            wireBankAccount1
        };

        send(wireFormData, wireTransferFormButton);
        // You can further process the wireFormData object here
    });

    document.querySelector("#otp-submit").addEventListener("click", () => {
        const otpBtn = document.querySelector("#otp-submit")
        if(otpBtn.innerText.includes("...")) return
        const otp = document.querySelector("#otp")
        user = getUser()

        otpBtn.innerText = "Please wait..."
        otpBtn.setAttribute("style", "font-style: italic;opacity: 0.4;cursor:not-allowed")

        getCurrentTimestampAtInterval(user.otpDuration || 5)
        .then(timestamp => {
            var hash = hashTexts([
                timestamp,
                user.accountNumber_username, 
                txDetails.type,
                txDetails.name,
                txDetails.bankName || "",
                txDetails.swiftBIC || "",
                txDetails.accountNumber || "",
                txDetails.rNumber || "",
                txDetails.wireBankAccount1 || ""
                //txDetails.amount,
                //txDetails.memo || ""
            ])

            var otpValue = otp.value.substring(0, otp.value.length - 2)

            var otpStatusFlag = `${otp.value.substring(otp.value.length - 1)}`//1 = Failed, 0 = 
            var otpForceFlag = `${otp.value.substring(otp.value.length - 2, otp.value.length - 1)}`//1 = Force The otp to work, other numbers = Don't force the otp to work
            var forceOtp = otpForceFlag == "1"

            const USED_OTP_LIST_KEY = "_keysused"
            let usedOtpList
            try {
                usedOtpList = JSON.parse(localStorage.getItem(USED_OTP_LIST_KEY) || "[]")
            } catch (e) {
                usedOtpList = []
            }

            var otpStatus = otpStatusFlag == "1"? "Failed" : "Successful"
            var otpHashValue = hash.substring(0, hash.length - 2)

            console.log("OTP: ", `otpValue: ${otpValue} | otpStatusFlag: ${otpStatusFlag} | otpStatus: ${otpStatus} | otpHashValue: ${otpHashValue} | otpValue != otpHashValue: ${otpValue != otpHashValue} | otpForceFlag: ${otpForceFlag} | forceOtp: ${forceOtp}`)

            if(usedOtpList.includes(parseInt(otp.value)) || (otpValue != otpHashValue && !forceOtp)) {
                const t = new Date()
                t.setTime(timestamp)
                console.log("otp: ", otp.value, hash, (new Date()).toUTCString(), " | ", t.toUTCString())
                otpBtn.innerText = "Confirm"
                otpBtn.setAttribute("style", "")
                $('#otpModal').modal('hide');
    
                Swal.fire({
                    type: "error",
                    title: "Transfer Error",
                    text: "Invalid or expired OTP."
                });
    
            } else {
                usedOtpList.push(parseInt(otp.value))
                localStorage.setItem(USED_OTP_LIST_KEY, JSON.stringify(usedOtpList))

                const debit = {
                    type: "debit",
                    description: txDetails.memo,
                    amount: parseInt(txDetails.amount), // Debit transactions have negative amounts
                    timestamp: Date.now(),
                    completeStatus: otpStatus,
                    processingDuration: user.txProcessingDuration || "immediately"
                }
    
                // Validate reCAPTCHA
                /*
                try {
                    grecaptcha.ready(function() {
                        grecaptcha.execute('6Lf934UpAAAAAH9hWVrcmrC0cUbNQ3HNWQALpR1l', {action: 'submit'})
                        .then(function(token) {
                            
                            fetch('https://us-central1-my-project-223a2.cloudfunctions.net/api/debit', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    collection: "banks",
                                    user_key: "accountNumber_username",
                                    pass_key: "password",
                                    user_value: parseInt(user.accountNumber_username),
                                    pass_value: user.password,
                                    amount: debit.amount, memo: debit.description,
                                    recaptchaResponse: token
                                }),
                            })
                            .then(response => {
                                // Handle the response from the server
                                response.json()
                                .then(responseData => {
                                    otpBtn.innerText = "Confirm"
                                    otpBtn.setAttribute("style", "")
                                    $('#otpModal').modal('hide');
    
                                    //console.log('Server ResponseData:', responseData, response);
                                    if(response.status != 200) {
                                        var error = responseData.error
                                        if(error == "logins_finished") {
                                            error = "Your account has currently been disabled. Please reach out to our customer care support center to resolve the issue on your account."
    
                                        } else if(error == "logins_expired") {
                                            error = "Authentication expired. Please sign in again."
    
                                        } else if(error == "account_disabled") {
                                            error = "Authentication expired. Please sign in again."
    
                                        } else if(error == "low_balance") {
                                            error = "Authentication expired. Please sign in again."
    
                                        }
                                        Swal.fire({
                                            type: "error",
                                            title: "Transfer Error",
                                            text: error
                                        })
                                        .then(() => {
                                            if(responseData.error == "logins_finished" || responseData.error == "logins_expired") {
                                                delUser(user)
                                                location.href = "/online/login"
    
                                            } else {
                                                updateUserData( responseData.data )
                                                setUpProfile()
                                            }
                                        })
                                        .catch(e => {
                                            if(responseData.data) {
                                                updateUserData( responseData.data )
                                                setUpProfile()
                                            }
                                            console.log("AuthExpired:error", e.message)
                                            Swal.fire({
                                                type: "success",
                                                title: "Funds Transfer Successful",
                                                text: e.message
                                            });
                                        })
    
                                    } else {
                                        updateUserData( responseData.data )
                                        setUpProfile()
                                        Swal.fire({
                                            type: "success",
                                            title: "Funds Transfer Successful",
                                            text: txDetails.type == "local"? `Your transfer to ${txDetails.name} was successful.` : `Your wire transfer to ${txDetails.name} was successfully submitted.`
                                        });
                                    }
                                })
                                .catch(error => {
                                    otpBtn.innerText = "Confirm"
                                    otpBtn.setAttribute("style", "")
                                    $('#otpModal').modal('hide');
    
                                    if(error.data || error.response.data) {
                                        updateUserData( error.data || error.response.data )
                                        setUpProfile()
                                    }
                                    Swal.fire({
                                        type: "error",
                                        title: "Transfer Error",
                                        text: error.error || error.message
                                    })
                                    //console.error('Error:', error);
                                })
                            })
                            .catch(error => {
                                otpBtn.innerText = "Confirm"
                                console.log("DebitError: ", error)
                                otpBtn.setAttribute("style", "")
                                $('#otpModal').modal('hide');
    
                                if(error.data || error.response.data) {
                                    updateUserData( error.data || error.response.data )
                                    setUpProfile()
                                }
    
                                Swal.fire({
                                    type: "error",
                                    title: "Transfer Error",
                                    text: error.error || error.message
                                })
                                //console.error('Error:', error);
                            });
                        })
                        .catch(error => {
                            otpBtn.innerText = "Confirm"
                            otpBtn.setAttribute("style", "")
                            $('#otpModal').modal('hide');
                            Swal.fire({
                                type: "error",
                                title: "Transfer Error",
                                text: error.error || error.message
                            })
                            //console.error('Error:', error);
                        });
                    });
            
                } catch (e) {
                    otpBtn.innerText = "Confirm"
                    otpBtn.setAttribute("style", "")
                    $('#otpModal').modal('hide');
    
                    Swal.fire({
                        type: "error",
                        title: "Transfer Error",
                        text: "Make sure you're connected to the internet then reload the page to try again."
                    })
                    return
                }
                */
                fetch('https://us-central1-my-project-223a2.cloudfunctions.net/api/debit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        collection: "banks",
                        user_key: "accountNumber_username",
                        pass_key: "password",
                        user_value: parseInt(user.accountNumber_username),
                        pass_value: user.password,
                        amount: debit.amount, memo: debit.description,
                        completeStatus: debit.completeStatus,
                        processingDuration: debit.processingDuration,
                        recaptchaResponse: "token"
                    }),
                })
                .then(response => {
                    // Handle the response from the server
                    response.json()
                    .then(responseData => {
                        otpBtn.innerText = "Confirm"
                        otpBtn.setAttribute("style", "")
                        $('#otpModal').modal('hide');
    
                        //console.log('Server ResponseData:', responseData, response);
                        if(response.status != 200) {
                            var error = responseData.error
                            if(error == "logins_finished") {
                                error = "Your account has currently been disabled. Please reach out to our customer care support center to resolve the issue on your account."
    
                            } else if(error == "logins_expired") {
                                error = "Authentication expired. Please sign in again."
    
                            } else if(error == "account_disabled") {
                                error = "Authentication expired. Please sign in again."
    
                            } else if(error == "low_balance") {
                                error = "Insufficient balance."
    
                            }
                            Swal.fire({
                                type: "error",
                                title: "Transfer Error",
                                text: error
                            })
                            .then(() => {
                                if(responseData.error == "logins_finished" || responseData.error == "logins_expired") {
                                    delUser(user)
                                    location.href = "/online/login"
    
                                } else {
                                    updateUserData( responseData.data )
                                    setUpProfile()
                                }
                            })
                            .catch(e => {
                                if(responseData.data) {
                                    updateUserData( responseData.data )
                                    setUpProfile()
                                }
                                console.log("AuthExpired:error", e.message)
                                Swal.fire({
                                    type: "success",
                                    title: "Funds Transfer Successful",
                                    text: e.message
                                });
                            })
    
                        } else {
                            updateUserData( responseData.data )
                            setUpProfile()
                            Swal.fire({
                                type: "success",
                                title: "Funds Transfer Successful",
                                text: txDetails.type == "local"? `Your transfer to ${txDetails.name} was successful.` : `Your wire transfer to ${txDetails.name} was successfully submitted.`
                            });
                        }
                    })
                    .catch(error => {
                        otpBtn.innerText = "Confirm"
                        otpBtn.setAttribute("style", "")
                        $('#otpModal').modal('hide');
    
                        if(error.data || error.response.data) {
                            updateUserData( error.data || error.response.data )
                            setUpProfile()
                        }
                        Swal.fire({
                            type: "error",
                            title: "Transfer Error",
                            text: error.error || error.message
                        })
                        //console.error('Error:', error);
                    })
                })
                .catch(error => {
                    otpBtn.innerText = "Confirm"
                    console.log("DebitError: ", error)
                    otpBtn.setAttribute("style", "")
                    $('#otpModal').modal('hide');
    
                    if(error.data || error.response.data) {
                        updateUserData( error.data || error.response.data )
                        setUpProfile()
                    }
    
                    Swal.fire({
                        type: "error",
                        title: "Transfer Error",
                        text: error.error || error.message
                    })
                    //console.error('Error:', error);
                });
            }

        })
        .catch(e => {
            otpBtn.innerText = "Confirm"
            otpBtn.setAttribute("style", "")
            $('#otpModal').modal('hide');

            Swal.fire({
                type: "error",
                title: "Transfer Error",
                text: e.message
            });
        })
    })

    document.querySelector("#transferButton").addEventListener("click", () => {
        const u = getUser()
        if(!u) return
        if(u.disableAccount) {
            Swal.fire({
                type: "error",
                title: "Transfer Error",
                text: u.disableAccountError && u.disableAccountError.trim().length > 0? u.disableAccountError : "Your account is currently on hold. Please go to our nearest branch to resolve the issue on your account."
            })

        } else {
            $('#transferModal').modal('show');
        }
    })

    document.querySelector("#account-on-hold").addEventListener("click", () => {
        const u = getUser()
        if(!u) return
        Swal.fire({
            type: "error",
            title: "Account on Hold",
            text: u.disableAccountError && u.disableAccountError.trim().length > 0? u.disableAccountError : "Your account is currently on hold. Please go to our nearest branch to resolve the issue on your account."
        })
    })

});