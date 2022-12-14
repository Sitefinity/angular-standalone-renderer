import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { LazyComponentsResponse } from "src/app/models/lazy-components.response";
import { PageLayoutServiceResponse } from "src/app/models/service-response";
import { RootUrlService } from "src/app/services/root-url.service";

@Injectable()
export class LayoutService {
    constructor(private http: HttpClient, private rootUrlService: RootUrlService) {

    }

    public get(pagePathAndQuery: string): Observable<PageLayoutServiceResponse> {
        return this.http.get<PageLayoutServiceResponse>(pagePathAndQuery, { headers: { "X-SFRENDERER-PROXY": "true", "X-SF-WEBSERVICEPATH": "api/default" } });
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
