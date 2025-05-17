**EIMU**
---

**Summary**

A plugin for Strapi CMS to help facilitate integration with Elasticsearch.

Via the plugin UI, a user can define ES indexes and also mappings matched to Strapi content type fields. The plugin listens for Strapi record-modification events and attempts to automatically index records onto ES indexes (registered in the plugin), according to the mappings.

*EIMU = "Elasticsearch Indexes & Mapping Utility"*

Author's note - I made this plugin to satisfy a few goals: learn Strapi plugin development, have a deeper understanding of Elasticsearch and help progress a large project I'm currently working on. The work originally started as a fork of [Punit Sethi's plugin](https://github.com/geeky-biz/strapi-plugin-elasticsearch), however EIMU's scope is much greater and essentially everything has been re-built.


**Installation**

(Under construction)

npm install
configuration file
run build
run dev
observe plugin works in Strapi dashboard
make sure ES running
check ES connection in plugin

(also, contributor steps)


**Usage**

On a high level...

 1. Register some indexes (in the plugin UI)
 2. Make some mappings (in the plugin UI)
 3. Now go ahead and modify some Strapi records (in whatever way you do that) of a type that you've defined mappings for
 4. Observe your ES index (in whatever way you do that) and confirm the newly indexed records

Essentially, the plugin listens to Strapi lifecycle events and takes actions if the affected records match a mapping you've defined amongst your registered ES indexes.

**Features**

(Underway)

 - Supports multiple ES indexes
 - Supports multiple content types (ie "Strapi collections") within one ES index
 - Supports ES dynamic mappings
 - Supports advanced ES mappings (e.g. geopoint)
 - Supports both instant-indexing and scheduled-indexing (cron cycle)
 - Supports relations i.e. if a record has relations, the plugin will index those too
 - Supports batch lifecycle actions
 - Supports mapping presets e.g. define a mapping for a content type and re-use it among multiple ES indexes

**Technical**

 - A react app (Strapi plugin)
 - Typescript
 - ES6
 - Elasticsearch 8 api

**Soon**

 - Strapi v5 support
 - v1.0 release (likely will only be for Strapi v5-and-up)
 - Strapi marketplace entry

**Future**

 - Support for multiple ES api versions (e.g. ES 9) - Makes sense
 - Support for OpenSearch - In theory this could be supported if patterns are similar
 - Support for Algolia - A wild thought; possible?
 - Support for agnostic vanilla indexes (JSON) - Instead of ES, a registered index is simply rendered as static JSON, accessible via an API route. EXAMPLE USE CASE: A Strapi content type is used as taxonomy entries, that needs to be fed to a website (moreover perhaps only at build-time) and is updated bi-monthly. It doesn't need searchability, and will have a maximum of say 50 objects each with 3 string fields. Elasticsearch is completely overkill for this context, however, it's *still* an index-with-mappings and still needs to be dynamically updated (without involving a developer doing a code update).
