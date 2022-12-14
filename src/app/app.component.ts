import { Component } from "@angular/core";
import { Meta } from "@angular/platform-browser";
import { ComponentContainer } from "./directives/component-wrapper.directive";
import { PageLayoutServiceResponse } from "./models/service-response";
import { ServiceMetadata } from "./sdk/service-metadata";
import { LayoutService } from "./sdk/services/layout.service";
import { RenderContext } from "./services/render-context";
import { RendererContractImpl } from "./editor/renderer-contract";
import { RequestContext } from "./services/request-context";
import { ModelBase } from "./models/model-base";

@Component({
    selector: "body",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.scss"]
})
export class AppComponent {
    public content: ComponentContainer[] = [];

    constructor(
        private serviceMetadata: ServiceMetadata,
        private meta: Meta,
        private renderContext: RenderContext,
        private rendererService: RendererContractImpl,
        private layoutService: LayoutService) {

    }

    ngOnInit(): void {
        this.serviceMetadata.fetch().subscribe(() => {
            this.layoutService.get(window.location.href).subscribe(s => {
                this.renderContext.cultureName = s.Culture;
                if (!this.renderContext.isEdit() && s.ComponentContext.HasLazyComponents) {
                    this.layoutService.getLazyComponents(window.location.href).subscribe((lazyComponentsResponse) => {
                        const lazyComponentsMap: {[key: string]: ModelBase<any>} = {};
                        lazyComponentsResponse.Components.forEach((component) => {
                            lazyComponentsMap[component.Id] = component;
                        });

                        this.setContent(s, {
                            DetailItem: s.DetailItem,
                            LazyComponentMap: lazyComponentsMap
                        });
                    });
                }

                if (!s.ComponentContext.HasLazyComponents) {
                    this.setContent(s, {
                        DetailItem: s.DetailItem,
                        LazyComponentMap: null
                    });
                }

                if (s.UrlParameters.length > 0 && !s.DetailItem) {
                    // this.router.navigate(["404"]);
                    this.fireEventForEditor();
                    return;
                }

                window.document.body.classList.add("container-fluid");
                this.fireEventForEditor();
                this.renderMetaInfo(s);
                this.renderScripts(s);
            });
        });
    }
    private setContent(response: PageLayoutServiceResponse, requestContext: RequestContext) {
        this.content = response.ComponentContext.Components.map(x => {
            return <ComponentContainer>{
                model: x,
                context: requestContext
            }
        });
    }


    private fireEventForEditor() {
        if (this.renderContext.isEdit()) {
            window.document.body.setAttribute('data-sfcontainer', 'Body');
            const timeout = 2000;
            const start = new Date().getTime();
            const handle = window.setInterval(() => {
                // we do not know the exact time when angular has finished the rendering process.
                // thus we check every 100ms for dom changes. A proper check would be to see if every single
                // component is rendered
                const timePassed = new Date().getTime() - start;
                if ((this.content.length > 0 && window.document.body.childElementCount > 0) || this.content.length === 0 || timePassed > timeout) {
                    window.clearInterval(handle);

                    (window as any)["rendererContract"] = this.rendererService;
                    window.dispatchEvent(new Event('contractReady'));
                }
            }, 100);
        }
    }

    private renderScripts(response: PageLayoutServiceResponse) {
        response.Scripts.forEach((script) => {
            const scriptElement = document.createElement('script');
            if (script.Source) {
                scriptElement.setAttribute('src', script.Source);
            }

            script.Attributes.forEach((attribute) => {
                scriptElement.setAttribute(attribute.Key, attribute.Value);
            });

            if (script.Value) {
                scriptElement.innerText = script.Value;
            }

            document.body.appendChild(scriptElement);
        });
    }

    private renderMetaInfo(s: PageLayoutServiceResponse) {
        if (s.MetaInfo) {
            document.title = s.MetaInfo.Title;

            const metaMap = {
                "og:title": s.MetaInfo.OpenGraphTitle,
                "og:image": s.MetaInfo.OpenGraphImage,
                "og:video": s.MetaInfo.OpenGraphVideo,
                "og:type": s.MetaInfo.OpenGraphType,
                "og:description": s.MetaInfo.OpenGraphDescription,
                "og:site": s.MetaInfo.OpenGraphSite,
            }

            Object.keys(metaMap).forEach((key) => {
                const val = (<any>metaMap)[key];
                if (val) {
                    this.meta.addTag({ property: key, content: val });
                }
            });

            if (s.MetaInfo.Description) {
                this.meta.addTag({ name: "description", content: s.MetaInfo.Description });
            }

            if (s.MetaInfo.CanonicalUrl) {
                const linkElement = document.createElement("link");
                linkElement.setAttribute("rel", "canonical");
                linkElement.setAttribute("href", s.MetaInfo.CanonicalUrl);
                document.head.appendChild(linkElement);
            }
        }
    }
}
