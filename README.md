Progress® Sitefinity® CMS sample angular standalone renderer app
======================================================

> **NOTE**: Latest supported version: Sitefinity CMS 14.2.7924.0

## Overview

The sample code in this repo implements a decoupled frontend SPA renderer for Sitefinity CMS. It uses the Sitefinity Layout API services to render the layout and widget content in Sitefinity MVC pages. This implementation also works with personalized pages and personalized widgets to enable per-user content personalization. The sample code uses the Angular framework.

## Who is this sample for
Angular developers that wish to develop with Sitefinity CMS and the Angular framework and utilize the WYSIWYG pag editor.

## How does it work
The WYSIWYG page editor of Sitefinity works with reusable components called widgets. Leveraging the power of the editor, developers can build custom SPA frontends for their users. This sample demonstrates how to integrate a custom front-end framework (such as Angular) in the page editor.

The whole renderer framework for the angular renderer is already built (including integration with the WYSIWYG editor), so all there is to do is just write 'Angular widgets'. Developing widgets for the Anuglar Renderer is just like developing plain Angular Components. There are some integration points which we will go through. For this purpose find the bellow Hello World tutorial 

## Hello World sample
### Building the component 

In order to build our own custom widget, we need to first create a folder that will hold our files. We will name our widget - ‘Hello World’ and it will be placed in the ‘hello-world' folder(under src/app/components). We then create a file in that folder called ‘hello-world.component.ts’ that will host our angular component. It will have the following content: 

``` typescript

import { Component } from "@angular/core";
import { BaseComponent } from "../base.component";
import { HelloWorldEntity } from "./hello-world-entity";

@Component({
    templateUrl: "hello-world.component.html",
    selector: "app-hello"
})
export class HelloWorldComponent extends BaseComponent<HelloWorldEntity> {

}


```

We need to add this component to our [app.module.ts](./src/app/app.module.ts) file in both 'declarations' and 'entrycomponents'.
Additionally add the 'app-hello' tag name to the [styles.scss](./src/styles.scss) file to make the tag a block element.

### Building the designer 

Second - we need to define the designer. This is done by creating a 'designer-metadata.json file' (name does not matter) and it will hold the metadata that will be read from the widget designer in order to construct the designer.

``` json
{
   "Name":"HelloWorld",
   "Caption":"HelloWorld",
   "PropertyMetadata":[
      {
         "Name":"Basic",
         "Sections":[
            {
               "Name":"Main",
               "Title":null,
               "Properties":[
                  {
                     "Name":"Message",
                     "DefaultValue":null,
                     "Title":"Message",
                     "Type":"string",
                     "SectionName":null,
                     "CategoryName":null,
                     "Properties":{
                        
                     },
                     "TypeChildProperties":[
                        
                     ],
                     "Position":0
                  }
               ],
               "CategoryName":"Basic"
            }
         ]
      },
      {
         "Name":"Advanced",
         "Sections":[
            {
               "Name":"AdvancedMain",
               "Title":null,
               "Properties":[
                  
               ],
               "CategoryName":null
            }
         ]
      }
   ],
   "PropertyMetadataFlat":[
      {
         "Name":"Message",
         "DefaultValue":null,
         "Title":"Message",
         "Type":"string",
         "SectionName":null,
         "CategoryName":null,
         "Properties":{
            
         },
         "TypeChildProperties":[
            
         ],
         "Position":0
      }
   ]
}
```

### Registration with the renderer framework
Once we have the above two files ready, we need to register the component implementation and the designer metadata with the Angular Renderer. 

For the component we need to go to the file [render-widget-service](./src/app/services/render-widget.service.ts) and to add a new entry to the TYPES_MAP object like so:

``` typescript

import { HelloWorldComponent } from "../components/hello-world/hello-world.component";

export const TYPES_MAP: { [key: string]: Function } = {
    "SitefinityContentBlock": ContentComponent,
    "SitefinitySection": SectionComponent,
    "SitefinityContentList": ContentListComponent,
    "HelloWorld": HelloWorldComponent
};

```

For the designer we need to go to the file [renderer-contract](./src/app/editor/renderer-contract.ts) and in the metadataMap object to add a new entry like so: 
``` typescript

import helloWorldJson from '../components/hello-world/designer-metadata.json';

@Injectable()
export class RendererContractImpl implements RendererContract {

    private metadataMap: { [key: string]: any } = {
        "SitefinityContentBlock": sitefinityContentBlockJson,
        "SitefinitySection": sitefinitySectionJson,
        "SitefinityContentList": sitefinityContentListJson,
        "HelloWorld": helloWorldJson
    }

```

Finally we need to register the widget to be shown in the widget selector interface. Go to the file [content-widgets.json](./src/app/editor/designer-metadata/content-widgets.json) and add a new entry after the SitefinityContentBlock registration: 

``` json
{ 
    "name": "HelloWorld", 
    "addWidgetName": null, 
    "addWidgetTitle": null, 
    "title": "Hello world", 
    "initialProperties": [] 
} 
```

Notice that everywhere above we are using the 'HelloWorld' name to register our component. This is a unique identifier for out component and is used everywhere where it is referenced.

## Deployment

There are two deployment techniques that can be levaraged - directly in the CMS(when you have the source code) or through a proxy app such as the Sitefinity .NET Renderer. This is covered and demonstrated [here](https://github.com/Sitefinity/sitefinity-aspnetcore-mvc-samples/tree/gebov/samples-for-14.3/src/standalone-spa-renderers#developing-with-the-client-side-renderers)

## Deep dive
### Building the component

All of the components must inherit from the [BaseComponent class](./src/app/components/base.component.ts) and must define their own entity class as a first generic argument. This 'entity' class will hold the properties that will be populated through the widget designer interface. So, when defining an 'Angular Widget', you will be working with the values that are entered through the automatically generated widget designer. Once your widget inherits from the base component you will automaitcally have access to the Model<TEntityType> property, where TEntityType is the type of the object that will be populated through the designer interface.
When the widgets are rendered in 'edit mode', the widget wrapping element is decorated with some [additional attributes](./src/app/services/render-widget.service.ts). These attributes are added only in edit mode and are not added on the live rendering. They are needed so the page editor knows which type of widget is currently being rendered.

Each widget must have a wrapper tag. Having two tags side by side on root level of the html of the component is not supported.

### Building the designer

The fields that appear are defined through a JSON file in the 'renderer-contract.ts' file. [All the capabilities](https://www.progress.com/documentation/sitefinity-cms/autogenerated-field-types) of the automatic widget designers are available for all the types of renderers delivering a universal UI. We have provided an [all-properties.json](./src/app/components/all-properties.json) file that holds all the available combinations for properties that you can use for your widgets, and you can simply copy-paste from there. Additionally, we have provided three widget implementations that each have their own designer file as a reference.

Some clarification on the schema of the json file. It holds the followin properites:

1. Name – This much match the name of the widget with which it is registered in the renderer-contract.ts file and the render-widget-service.ts file.
2. Caption – The user friendly name of the widget that will be presented when the designer is opened
3. PropertyMetadata and PropertyMetadata flat both hold the metadata for all of the properites, with the exception that PropertyMetadata holds the metadata in a hierarchical manner. This property is used to construct widget designers. Whereas the flat collection is used for validation.
4. The more used metadata properties that define each field are:
 Name – the name of the field,
 DefaultValue – the default value
 Title – user friendly name of the field,
 Type - the type of the property – see the all-properties.json file for all types of fields.
 SectionName: the name of the section in which this field belongs
 CategoryName: null for Basic or Advanced
 Properties: holds additional metadata properties - see the all-properties.json file for more examples.
