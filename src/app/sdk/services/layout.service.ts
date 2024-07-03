import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { LazyComponentsResponse } from "src/app/models/lazy-components.response";
import { PageLayoutServiceResponse } from "src/app/models/service-response";
import { RootUrlService } from "src/app/services/root-url.service";

@Injectable()
export class LayoutService {
    private readonly systemQueryParams = ["sfaction", "sf_version", "segment", "sf_site", "sf_site_temp", "sf-auth", "abTestVariationKey", "sf-content-action", "sf-lc-status"];
    constructor(private http: HttpClient, private rootUrlService: RootUrlService) {

    }

    public get(pagePathAndQuery: string): Observable<PageLayoutServiceResponse> {
        let systemQuery: string = '';

        if (pagePathAndQuery.indexOf("?") !== -1) {
            const index = pagePathAndQuery.indexOf("?");

            const query = pagePathAndQuery.substring(pagePathAndQuery.indexOf("?"));
            const parsedParams = new URLSearchParams(query);
            
            const systemQueryList: Array<{key: string, val: string}> = [];
            const customQueryList: Array<{key: string, val: string}> = [];
            parsedParams.forEach((paramVal, paramKey) => {
                if (this.systemQueryParams.some(x => x === paramKey)) {
                    systemQueryList.push({ key: paramKey, val: paramVal });
                } else {
                    customQueryList.push({ key: paramKey, val: paramVal });
                }
            });
            
            pagePathAndQuery = pagePathAndQuery.substring(0, index) + "?" + customQueryList.map(x => `${x.key}=${x.val}`).join('&');
            systemQuery =  "&" + systemQueryList.map(x => `${x.key}=${x.val}`).join('&');
        }

        let serviceUrl = `${this.rootUrlService.getServiceUrl()}pages/Default.Model(url=@param)?@param='${encodeURIComponent(pagePathAndQuery)}'${systemQuery}`;
        return this.http.get<PageLayoutServiceResponse>(serviceUrl);
    }

    public getLazyComponents(pagePathAndQuery: string): Observable<LazyComponentsResponse> {
        var headers: {[key: string]: string} = {};
        var referrer = document.referrer;
        if (referrer && referrer.length > 0) {
            headers["SF_URL_REFERER"] = referrer;
        }
        else {
            headers["SF_NO_URL_REFERER"] = 'true';
        }

        let serviceUrl = `${this.rootUrlService.getServiceUrl()}Default.LazyComponents(url=@param)?@param='${encodeURIComponent(pagePathAndQuery)}'`;
        serviceUrl += "&correlationId=" + (window as any)["sfCorrelationId"];

        return this.http.get<LazyComponentsResponse>(serviceUrl, { headers });
    }
}
