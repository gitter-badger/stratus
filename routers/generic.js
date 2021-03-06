//     Stratus.Routers.Generic.js 1.0

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

// Function Factory
// ----------------

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(["stratus", "underscore", "backbone"], factory);
    } else {
        factory(root.Stratus, root._, root.Backbone);
    }
}(this, function (Stratus, _, Backbone) {

    // Generic Router
    // -------------

    // TODO: This basically needs to handle every collection separately by use of the stratus model and collection references provided by the loader and an entity identifier to determine which to add the new one on
    Stratus.Routers.Generic = Backbone.Router.extend({
        routes: {
            "new/:entity": "new",
            "filter/:entity": "filter",
            "filter/:entity/:filter": "filter",
            "page/:entity": "paginate",
            "page/:entity/:page": "paginate"
        },
        initialize: function (options) {
            if (!Stratus.Environment.get('production')) console.info("Generic Router Invoked!");
        },
        change: function (bubble) {
            if (!Stratus.Environment.get('production')) console.log('Model(s):', arguments);
        },
        new: function (entity) {
            if (!Stratus.Environment.get('production')) console.log('Route New:', arguments);
            var collection = Stratus.Collections.get(_.ucfirst(entity));
            if (typeof collection === 'object') {
                this.navigate('#');
                collection.create(_.has(collection, 'prototype') ? collection.prototype : {}, {wait: true});
            }
        },
        filter: function (entity, filter) {
            if (typeof filter === 'undefined') filter = '';
            if (!Stratus.Environment.get('production')) console.log('Route Filter:', arguments);
            var collection = Stratus.Collections.get(_.ucfirst(entity));
            if (typeof collection === 'object') {
                if (collection.meta.has('api')) {
                    if (collection.meta.has('api.q')) {
                        collection.meta.set('api.q', filter);
                    } else {
                        collection.meta.set('api', _.extend(collection.meta.get('api'), {q: filter}));
                    }

                    // Reset to Page 1 on every new Query
                    if (collection.meta.has('api.p')) {
                        collection.meta.set('api.p', 1);
                    }
                } else {
                    collection.meta.set('api.q', filter);
                }
                collection.refresh({reset: true});
                if (!Stratus.Environment.get('production')) console.info('Route Filter', filter);
            }
        },
        paginate: function (entity, page) {
            if (typeof page === 'undefined') page = '1';
            if (!Stratus.Environment.get('production')) console.log('Entity:', entity, 'Page:', page);
            var collection = Stratus.Collections.get(_.ucfirst(entity));
            if (typeof collection === 'object') {
                if (collection.isHydrated()) {
                    if (collection.meta.has('pageCurrent') && collection.meta.get('pageCurrent') !== parseInt(page)) {
                        if (collection.meta.get('pageTotal') >= parseInt(page) && parseInt(page) >= 1) {
                            collection.meta.set('api.p', page);
                            collection.refresh({reset: true});
                        } else {
                            if (!Stratus.Environment.get('production')) console.log('Page', page, 'of entity', entity, 'does not exist.');
                        }
                    }
                } else {
                    collection.once('reset', function () {
                        this.paginate(entity, page);
                    }, this);
                }
            } else {
                Stratus.Collections.once('change:' + _.ucfirst(entity), function () {
                    this.paginate(entity, page);
                }, this);
            }
        }
    });

    // Require.js
    // -------------

    // We are not returning this module because it should be
    // able to add its objects to the Stratus object reference,
    // passed by sharing.

}));
