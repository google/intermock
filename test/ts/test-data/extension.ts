/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

interface Temp {
  employmentAgency: string;
}

interface Background {
  school: string;
}


interface User {
  username: string;
}

interface Employee extends User {
  isActive: boolean;
  startDate: string;
  background: Background;
}

interface Contractor extends Employee, Temp {
  endDate: string;
}

export const expectedContractor = {
  Contractor: {
    employmentAgency:
        'Animi repellat eveniet eveniet dolores quo ullam rerum reiciendis ipsam. Corrupti voluptatem ipsa illum veritatis eligendi sit autem ut quia. Ea sint voluptas impedit ducimus dolores possimus.',
    username: 'Jakob10',
    isActive: true,
    startDate: 'Thu Dec 28 2017 20:44:18 GMT-0800 (PST)',
    endDate: 'Sun Apr 28 2019 23:50:14 GMT-0700 (PDT)',
    background: {
      school:
          'Animi repellat eveniet eveniet dolores quo ullam rerum reiciendis ipsam. Corrupti voluptatem ipsa illum veritatis eligendi sit autem ut quia. Ea sint voluptas impedit ducimus dolores possimus.'
    }
  }
};
