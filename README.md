jQuery Universal Language Selector
==================================
Universal  Language Selector

Introduction
-------------



Preparing language data
------------------------

The language names, autonyms, region informations are present in src/jquery.uls.data.js.
But this file is auto generated from data/langdb.yaml. If you want to make any changes to the 
language data, edit data/langdb.yaml and generate the src/jquery.uls.data.js using

```bash
php ulsdata2json.php
```
