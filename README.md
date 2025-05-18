# EIMU

## Summary

A plugin for [Strapi](https://strapi.io) to help facilitate integration with [Elasticsearch](https://www.elastic.co).

Via the plugin UI, you can define multiple Elasticsearch indexes and create reuseable mappings matched to Strapi content type fields. In addition, the plugin listens to Strapi events and will automatically index CMS records onto ES indexes, according to the indexes and mappings setup within the plugin.

*EIMU = "Elasticsearch Index & Mapping Utility"*

Author's note - I made this plugin to satisfy a few goals: learn Strapi plugin development, have a deeper understanding of Elasticsearch and help progress a large project I'm currently working on. The work originally started as a fork of [Punit Sethi's plugin](https://github.com/geeky-biz/strapi-plugin-elasticsearch), however EIMU's scope is much greater and essentially everything has been re-built.


## Installation

Note: An official npm release is coming soon.

For now, anyone wishing to experiment with the plugin in the current state, follow these steps:

### Pre-requisites

- Working Strapi v4 instance
- Working Elasticsearch instance

### Steps

1. Clone this repo into your Strapi plugins folder; the folder structure would be: `src/plugins/eimu/`
2. Within the plugin folder, install packages via `npm install`
3. Define env variables (see below)
4. In your Strapi plugins config, add an entry for this plugin (see below)
5. Build Strapi, via `strapi build` in Strapi root
6. Run Strapi, via `strapi develop` in Strapi root
7. Open Strapi and observe the plugin; you should see it in the navigation plugins section: "EIMU"

**.env variables**

URL example: `https://localhost:9200`
```
ELASTIC_HOST="YOUR_ES_URL"
ELASTIC_USERNAME="YOUR_ES_USERNAME"
ELASTIC_PASSWORD="YOUR_ES_PASSWORD"
```

**config/plugins.ts**
```
export default () => ({

    'eimu': {
    
        enabled: true,
        resolve: "./src/plugins/eimu",        
        config: {
            connection: {
                host: process.env.ELASTIC_HOST,
                username: process.env.ELASTIC_USERNAME,
                password: process.env.ELASTIC_PASSWORD,
            }

            // OPTIONAL
            // For not-instant indexing...
            // Define cron schedule for processing of indexing tasks

            cronSchedule: "* * * * *"

            // Examples:
            // cronSchedule: "0 1 * * *" // run daily at 1:00 AM
            // cronSchedule: "* * * * *" // run every minute

        }
    }

})
```

## Usage

On a high level...

(in the plugin UI)

 1. Register some indexes
 2. Make some mappings within that index

(now use Strapi like normal)

 4. Go ahead and modify some Strapi records (in whatever way you do that) of a type that you've defined mappings for
 5. Observe your ES index (in whatever way you do that) and confirm the newly indexed records

Essentially, when active, the plugin listens to [Strapi lifecycle events](https://docs-v4.strapi.io/dev-docs/backend-customization/models#lifecycle-hooks) and will automatically index affected records, according to the indexes and mappings you've defined in the plugin.

## Features

(Underway)

 - Multiple ES indexes
 - Multiple type mappings per index
 - Re-useable (preset) mappings
 - Relations i.e. if a record has relations, the plugin will index those too
 - Instant-indexing and scheduled-indexing (cron cycle)
 - ES dynamic mappings
 - Advanced ES mappings (e.g. geopoint)
 - Batch lifecycle events
 - Mapping presets e.g. define a mapping for a content type and re-use it among multiple ES indexes
 - Orphan scan and removal
 - Export/import

## Technical

 - A react app (Strapi plugin)
 - Typescript
 - ES6
 - Elasticsearch 8 API

## Soon

 - Strapi v5 support
 - npm release
 - [Strapi Marketplace](https://market.strapi.io) entry

## Future

 - Support for multiple ES API versions (e.g. ES 9) - Makes sense
 - Support for OpenSearch - In theory this could be supported if patterns are similar
 - Support for Algolia - A wild thought; possible?
 - Support for agnostic vanilla indexes (JSON) - Instead of ES, a registered index is simply rendered as static JSON, accessible via an API route. EXAMPLE USE CASE: A Strapi content type is used as taxonomy entries, that needs to be fed to a website (moreover perhaps only at build-time) and is updated bi-monthly. It doesn't need searchability, and will have a maximum of say 50 objects each with 3 string fields. Elasticsearch is completely overkill for this context, however, it's *still* an index-with-mappings and still needs to be dynamically updated (without involving a developer doing a code update).
