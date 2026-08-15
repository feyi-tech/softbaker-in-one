

export default function ({}) {

    return (
        <style jsx global={true}>{`
        .react-datetime-picker__calendar-button { display: none !important; }
        .react-datetime-picker__wrapper {width: auto !important; max-width: auto !important}
        .react-datetime-picker {
            display: inline-flex;
            position: relative;
            width: 100%;
          }
          .react-datetime-picker,
          .react-datetime-picker *,
          .react-datetime-picker *:before,
          .react-datetime-picker *:after {
            -moz-box-sizing: border-box;
            -webkit-box-sizing: border-box;
            box-sizing: border-box;
          }
          .react-datetime-picker--disabled {
            background-color: #f0f0f0;
            color: #6d6d6d;
          }
          .react-datetime-picker__wrapper {
            display: flex;
            flex-grow: 1;
            flex-shrink: 0;
            width: 100%;
            min-width: 0px;
            outline: 2px solid transparent;
            outline-offset: 2px;
            position: relative;
            -webkit-appearance: none;
            -moz-appearance: none;
            -ms-appearance: none;
            appearance: none;
            transition-property: var(--chakra-transition-property-common);
            transition-duration: var(--chakra-transition-duration-normal);
            font-size: var(--chakra-fontSizes-md);
            -webkit-padding-start: var(--chakra-space-4);
            padding-inline-start: var(--chakra-space-4);
            -webkit-padding-end: var(--chakra-space-4);
            padding-inline-end: var(--chakra-space-4);
            height: var(--chakra-sizes-10);
            border-radius: var(--chakra-radii-md);
            border: 1px solid;
            border-color: inherit;
            background: inherit;
          }
          .react-datetime-picker__inputGroup {
            min-width: calc(4px + (4px * 3) +  0.54em * 6  +  0.217em * 2);
            flex-grow: 1;
            padding: 0 2px;
          }
          .react-datetime-picker__inputGroup__divider {
            padding: 1px 0;
            white-space: pre;
          }
          .react-datetime-picker__inputGroup__input {
            min-width: 0.54em;
            height: calc(100% - 2px);
            position: relative;
            padding: 1px;
            border: 0;
            background: none;
            font: inherit;
            box-sizing: content-box;
            -moz-appearance: textfield;
          }
          .react-datetime-picker__inputGroup__input::-webkit-outer-spin-button,
          .react-datetime-picker__inputGroup__input::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
          .react-datetime-picker__inputGroup__input:invalid {
            background: rgba(255, 0, 0, 0.1);
          }
          .react-datetime-picker__inputGroup__input--hasLeadingZero {
            margin-left: -0.54em;
            padding-left: calc(1px +  0.54em);
          }
          .react-datetime-picker__inputGroup__amPm {
            font: inherit;
            -moz-appearance: menulist;
          }
          .react-datetime-picker__button {
            border: 0;
            background: transparent;
            padding: 4px 6px;
          }
          .react-datetime-picker__button:enabled {
            cursor: pointer;
          }
          .react-datetime-picker__button .react-datetime-picker__button__icon {
            stroke: #000;
          }
          body.chakra-ui-dark .react-datetime-picker__button .react-datetime-picker__button__icon {
            stroke: #fff;
          }
          .react-datetime-picker__button .react-datetime-picker__clear-button__icon {
            stroke: #e53e3e !important;
          }

          .react-datetime-picker__button:enabled:hover .react-datetime-picker__button__icon,
          .react-datetime-picker__button:enabled:focus .react-datetime-picker__button__icon {
            stroke: #0078d7 !important;
          }
          .react-datetime-picker__button:disabled .react-datetime-picker__button__icon {
            stroke: #6d6d6d !important;
          }
          .react-datetime-picker__button svg {
            display: inherit;
          }
          .react-datetime-picker__calendar,
          .react-datetime-picker__clock {
            position: absolute;
            top: 100%;
            left: 0;
            z-index: 1;
          }
          .react-datetime-picker__calendar--closed,
          .react-datetime-picker__clock--closed {
            display: none;
          }
          .react-datetime-picker__calendar {
            width: 350px;
            max-width: 100vw;
          }
          .react-datetime-picker__calendar .react-calendar {
            border-width: thin;
          }
          .react-datetime-picker__clock {
            width: 200px;
            height: 200px;
            max-width: 100vw;
            padding: 25px;

            border-radius: var(--chakra-radii-md);
            border: 1px solid;
            border-color: inherit;
          }
          
          /**Calendar**/

          .react-calendar {
            width: 350px;
            max-width: 100%;
            font-family: Arial, Helvetica, sans-serif;
            line-height: 1.125em;
            
            border-radius: var(--chakra-radii-md);
            border: 1px solid;
            border-color: inherit;
          }
          .chakra-ui-light .react-calendar, .chakra-ui-light .react-datetime-picker__clock {
            background: rgb(255, 255, 255) !important
          }
          .chakra-ui-dark .react-calendar, .chakra-ui-dark .react-datetime-picker__clock {
            background: rgb(39, 38, 44) !important
          }
          .react-calendar--doubleView {
            width: 700px;
          }
          .react-calendar--doubleView .react-calendar__viewContainer {
            display: flex;
            margin: -0.5em;
          }
          .react-calendar--doubleView .react-calendar__viewContainer > * {
            width: 50%;
            margin: 0.5em;
          }
          .react-calendar,
          .react-calendar *,
          .react-calendar *:before,
          .react-calendar *:after {
            -moz-box-sizing: border-box;
            -webkit-box-sizing: border-box;
            box-sizing: border-box;
          }
          .react-calendar button {
            margin: 0;
            border: 0;
            outline: none;
          }
          .react-calendar button:enabled:hover {
            cursor: pointer;
          }
          .react-calendar__navigation {
            display: flex;
            height: 44px;
            margin-bottom: 1em;
          }
          .react-calendar__navigation button {
            min-width: 44px;
            background: none;
          }
          .react-calendar__navigation button:disabled {
            background-color: #f0f0f0;
          }
          .react-calendar__navigation button:enabled:hover,
          .react-calendar__navigation button:enabled:focus {
            background-color: #e6e6e6;
          }
          .react-calendar__month-view__weekdays {
            text-align: center;
            text-transform: uppercase;
            font-weight: bold;
            font-size: 0.75em;
          }
          .react-calendar__month-view__weekdays__weekday {
            padding: 0.5em;
          }
          .react-calendar__month-view__weekNumbers .react-calendar__tile {
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.75em;
            font-weight: bold;
          }
          .react-calendar__month-view__days__day--weekend {
            color: #d10000;
          }
          .react-calendar__month-view__days__day--neighboringMonth {
            color: #757575;
          }
          .react-calendar__year-view .react-calendar__tile,
          .react-calendar__decade-view .react-calendar__tile,
          .react-calendar__century-view .react-calendar__tile {
            padding: 2em 0.5em;
          }
          .react-calendar__tile {
            max-width: 100%;
            padding: 10px 6.6667px;
            background: none;
            text-align: center;
            line-height: 16px;
          }
          .react-calendar__tile:disabled {
            background-color: #f0f0f0;
          }
          .react-calendar__tile:enabled:hover,
          .react-calendar__tile:enabled:focus {
            background-color: #e6e6e6;
          }
          .react-calendar__tile--now {
            background: #ffff76;
          }
          .react-calendar__tile--now:enabled:hover,
          .react-calendar__tile--now:enabled:focus {
            background: #ffffa9;
          }
          .react-calendar__tile--hasActive {
            background: #76baff;
          }
          .react-calendar__tile--hasActive:enabled:hover,
          .react-calendar__tile--hasActive:enabled:focus {
            background: #a9d4ff;
          }
          .react-calendar__tile--active {
            background: #006edc;
            color: white;
          }
          .react-calendar__tile--active:enabled:hover,
          .react-calendar__tile--active:enabled:focus {
            background: #1087ff;
          }
          .react-calendar--selectRange .react-calendar__tile--hover {
            background-color: #e6e6e6;
          }
          
          /** Clock **/

          .react-clock {
            display: block !important;
            position: relative;
          }
          .react-clock,
          .react-clock *,
          .react-clock *:before,
          .react-clock *:after {
            -moz-box-sizing: border-box;
            -webkit-box-sizing: border-box;
            box-sizing: border-box;
          }
          .react-clock__face {
            position: absolute;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
            border: 1px solid black;
            border-radius: 50%;
          }
          .react-clock__hand {
            position: absolute;
            top: 0;
            bottom: 0;
            left: 50%;
            right: 50%;
          }
          .react-clock__hand__body {
            position: absolute;
            background-color: black;
            transform: translateX(-50%);
          }
          .react-clock__mark {
            position: absolute;
            top: 0;
            bottom: 0;
            left: 50%;
            right: 50%;
          }
          .react-clock__mark__body {
            position: absolute;
            background-color: black;
            transform: translateX(-50%);
          }
          .react-clock__mark__number {
            position: absolute;
            left: -40px;
            width: 80px;
            text-align: center;
          }
          .react-clock__second-hand__body {
            background-color: red;
          }
          
        `}</style>
    )
}