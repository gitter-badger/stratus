//     Stratus.Views.Display.js 1.0

//     Copyright (c) 2016 by Sitetheory, All Rights Reserved
//
//     All information contained herein is, and remains the
//     property of Sitetheory and its suppliers, if any.
//     The intellectual and technical concepts contained herein
//     are proprietary to Sitetheory and its suppliers and may be
//     covered by U.S. and Foreign Patents, patents in process,
//     and are protected by trade secret or copyright law.
//     Dissemination of this information or reproduction of this
//     material is strictly forbidden unless prior written
//     permission is obtained from Sitetheory.
//
//     For full details and documentation:
//     http://docs.sitetheory.io

// Examples
// ========

// Data Attributes to Control Options
// ----------------------------------
// If you need to manipulate the widget, you can set data attributes to change the default values. See the options in this.options below to know which attributes can be modified from the data attributes.

// Widget
// ======

// Function Factory
// ----------------

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(["stratus", "jquery", "underscore", "moment", "stratus.views.widgets.base"], factory);
    } else {
        factory(root.Stratus, root.$, root._, root.moment);
    }
}(this, function (Stratus, $, _, moment) {

    // Display Widget
    // -------------

    // Display view which extends the base view.
    Stratus.Views.Widgets.Display = Stratus.Views.Widgets.Base.extend({

        // Properties
        model: Stratus.Models.Generic,

        options: {
            private: {
                editable: false,
                autoSave: false,
                forceType: 'model'
            },
            public: {
                // The type of data which determines how the value should be formatted, e.g. date, timeSince, timeSinceDate
                formatType: null,
                // The format that should be applied, e.g. when used in conjunction with date this should be a valid Moment format.
                format: 'MMM D, YYYY @h:mm a',
                // A way to flag the element for initiating a refresh at a set interval (milliseconds to lapse between refreshes).
                interval: null,
                // text prepended before value
                before: null,
                // text appended after value
                after: null,
                // Option used with format=timeSincedate. This is the amount of seconds to show "timeSince" formatting,
                // after which the simple date will display
                timeSinceLimit: 3600
            }
        },


        // promise()
        // -------------
        // Begin initializing the widget within an asynchronous promise realm
        /**
         * @param options
         * @param fulfill
         * @param reject
         */
        /*
        promise: function (options, fulfill, reject) {
            // This is not necessary, since it will already automatically update whenever the model changes.
            // Also it appears to be set to 60 seconds (60000) from somewhere unknown
            if (this.options.interval) {
                setInterval(function () {
                    this.scopeChanged();
                }.bind(this), this.options.interval);
            }
        },
        */

        // validate()
        // -----------
        // Custom validate to check that the element contains the minimum required data attributes
        /**
         * @returns {boolean}
         */
        validate: function () {
            if (!this.$el.data('property')) {
                // message, title, class
                Stratus.Events.trigger('toast', 'The data-property attribute is missing.', 'Missing Data Attribute', 'danger');
                return false;
            }
            return true;
        },

        // postOptions()
        // -----------------
        // Set combination of default options contingent on other options
        /**
         * @param options
         * @returns {boolean}
         */
        postOptions: function (options) {
            if (this.options.formatType === 'timeSinceDate' && !this.options.interval) {
                this.options.interval = 60000;
            }
            return true;
        },

        // setValue()
        // -----------
        // Set the processed value on the DOM element
        /**
         * @param value
         * @returns {*}
         */
        setValue: function (value) {
            this.propertyValue = this.processValue(value);
            this.$el.html(this.propertyValue);
            return this.propertyValue;
        },

        // processValue()
        // ---------------
        // Process the value based on predefined types, e.g. date, timesince, etc
        /**
         * @param value
         * @returns {*}
         */
        processValue: function (value) {
            value = (typeof value !== 'undefined' && value) ? value : '';

            if (this.options.formatType === 'date') {
                value = this.formatDate(value);
            } else if (this.options.formatType === 'timeSince') {
                value = this.formatTimeSince(value);
            } else if (this.options.formatType === 'timeSinceDate') {
                value = this.formatTimeSinceDate(value);
            }

            value = this.options.before ? this.options.before.toString() + value.toString() : value;
            value = this.options.after ? value.toString() + this.options.after.toString() : value;

            return value;
        },


        // formatDate()
        // ---------------
        // Format: Show the specific date
        /**
         * @param value
         * @returns {*}
         */
        formatDate: function (value) {
            value = parseInt(value);
            value = moment.unix(value).format(this.options.format);
            return value;
        },

        // formatTimeSince()
        // ---------------
        // Format: Show the time since now
        /**
         * @param value
         * @returns {*}
         */
        formatTimeSince: function (value) {
            value = parseInt(value);
            return moment.unix(value).fromNow();
        },

        // formatTimeSinceDate()
        // ---------------
        // Format: show the time since now, if it's less than the timeSinceLimit (default 1 hour), otherwise show the date
        /**
         * @param value
         * @returns {*}
         */
        formatTimeSinceDate: function (value) {
            value = parseInt(value);
            if ((moment().unix() - value) < this.options.timeSinceLimit) {
                value = this.formatTimeSince(value);
            } else {
                value = this.formatDate(value);
            }
            return value;
        }

    });
}));
