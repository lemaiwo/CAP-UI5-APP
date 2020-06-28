using { sap.capire.bookshop as my } from '../db/data-model';
service CatalogService @(path:'/browse')  @(requires:'authenticated-user') {

  @readonly entity Books as SELECT from my.Books {*,
    author.name as author
  } excluding { createdBy, modifiedBy };
}