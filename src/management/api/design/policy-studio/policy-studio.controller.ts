import { StateService } from '@uirouter/core';

/*
 * Copyright (C) 2015 The Gravitee team (http://gravitee.io)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


// tslint:disable-next-line:no-var-requires
require('@gravitee/ui-components/wc/gv-policy-studio');
// tslint:disable-next-line:no-var-requires
const style = require('@asciidoctor/core/dist/css/asciidoctor.css')[0][1];

class ApiPolicyStudioController {
  private studio: Element;
  private api: any;

  constructor(
    private resolvedResources,
    private resolvedPolicies,
    private resolvedFlowSchema,
    private PolicyService,
    private ResourceService,
    private $scope,
    private ApiService,
    private NotificationService,
    private $rootScope,
  ) {
    'ngInject';
  }

  $onInit = () => {
    this.studio = document.querySelector('gv-policy-studio');
    this.api = this.$scope.$parent.apiCtrl.api;
    this.studio.setAttribute('definition', JSON.stringify({
      'name': this.api.name,
      'version': this.api.version,
      'flows': this.api.flows != null ? this.api.flows : [],
      'resources': this.api.resources
    }));
    this.studio.setAttribute('can-add', 'true');
    this.studio.setAttribute('can-delete', 'true');
    this.studio.addEventListener('gv-policy-studio:edit-resource', this.editResource);
    this.studio.addEventListener('gv-policy-studio:save', this.onSave.bind(this));
    this.studio.addEventListener('gv-policy-studio:select-policy', this.select);
    this.studio.setAttribute('resources', JSON.stringify(this.resolvedResources.data));
    this.studio.setAttribute('policies', JSON.stringify(this.resolvedPolicies.data));
    this.studio.setAttribute('flowForm', JSON.stringify(this.resolvedFlowSchema.data));
    this.studio.addEventListener('gv-policy-studio:edit-flow-rule', this.editFlowRule.bind(this));
    this.studio.addEventListener('gv-policy-studio:edit-resource', this.loadResourceDocumentation.bind(this));
    this.studio.addEventListener('gv-policy-studio:select-policy', this.selectPolicy.bind(this));
  };

  editFlowRule({detail}) {
    this.loadPolicyDocumentation(detail.policy);
  }

  selectPolicy({detail}) {
    this.loadPolicyDocumentation(detail.policy);
  }

  loadPolicyDocumentation(policy) {
    this.studio.setAttribute('documentation', null);
    this.PolicyService.getDocumentation(policy.id).then((response) => {
      const title = `${policy.name} documentation`;
      const asciidoctor = require('@asciidoctor/core')();
      const content = asciidoctor.convert(response.data);
      this.studio.setAttribute('documentation', JSON.stringify({title, content, style, source: policy} ));
    });
  }

  loadResourceDocumentation({detail}) {
    this.studio.setAttribute('documentation', null);
    const resource = detail.resource;
    this.ResourceService.getDocumentation(resource.type).then((response) => {
      const title = `${resource.name || resource.type} documentation`;
      const asciidoctor = require('@asciidoctor/core')();
      const content = asciidoctor.convert(response.data);
      this.studio.setAttribute('documentation', JSON.stringify({title, content, style, source: resource}));
    });
  }

  editResource() {

  }

  select() {

  }

  onSave({detail}) {
    this.api.flows = detail.definition.flows;
    this.api.resources = detail.definition.resources;
    this.ApiService.update(this.api).then((updatedApi) => {
      this.NotificationService.show('Design of api has been updated');
      this.api = updatedApi.data;
      this.$rootScope.$broadcast('apiChangeSuccess', {api: this.api});
    });
  }

}

export default ApiPolicyStudioController;
