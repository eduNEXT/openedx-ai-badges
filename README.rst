AI Badges Generator
####################


|Status Badge| |License Badge|

.. |Status Badge| image:: https://img.shields.io/badge/Status-Experimental-orange
   :alt: Experimental Status

.. |License Badge| image:: https://img.shields.io/badge/License-AGPL%20v3-blue
   :alt: License


**openedx-ai-badges** is a modular extension for the Open edX AI infrastructure. It demonstrates how to build custom AI-driven features—specifically badge generation—by extending core components like **orchestrators, processors, and actuators**. It serves as both a functional tool and a reference implementation for registering custom AI profiles and UI slots.

.. contents::
   :local:
   :depth: 2

Overview
********

**openedx-ai-badges** is an AI-powered badge generation tool built as an extension of the `openedx-ai-extensions` framework. This project serves as a practical implementation of extending the Open edX AI infrastructure by registering new orchestrators, processors, UI slots, and AI profiles.

With this plugin, we demonstrate the modularity of the AI framework by extending orchestrators, processors, and actuators to handle custom badge-related logic.

Current Status
**************

.. warning::
   **Experimental** - This plugin is in active development and should not be used in production environments.

This is an exploratory project developed by edunext as part of FC-111 to investigate AI extensibility patterns for the Open edX platform. The plugin serves as a testing ground for AI integration concepts that may inform future development.

**What Works:**

- Custom AI profile registration for badge generation
- UI slot registration for badge display
- Basic orchestrator and processor logic for badge generation

Installation
************

Prerequisites
=============

This plugin requires the base AI extension framework to be installed and configured:

* **openedx-ai-extensions**: `Follow the official setup guide <https://github.com/openedx/openedx-ai-extensions/blob/main/README.rst>`_.


Installation
============

Install the plugin in your Open edX environment using the provided tutor plugin::

    pip install git+https://github.com/openedx/openedx-ai-badges.git
    tutor plugins enable openedx-ai-badges
    tutor images build openedx
    tutor images build mfe
    tutor local launch


Usage
=====

The **openedx-ai-badges** plugin extends the base AI framework by providing specialized badge-generation workflows. To use it:

1. **Configure Providers**: Ensure you have configured your AI providers as described in the `AI Extensions Configuration Guide <https://docs.openedx.org/projects/openedx-ai-extensions/en/latest/quickstarts/configuration_guide.html#configuring-providers>`_.
2. **Setup AI Profile**: 
   - Go to the Django Admin.
   - Create or edit an AI **Profile** and set the implementation to ``badges_base``.
3. **Assign Scope**: 
   - Create an AI **Scope** (e.g., for CMS/Studio).
   - Link the scope to your ``badges_base`` profile.
4. **Trigger Generation**: 
   - Enter the CMS. You will see a new UI element: "Generate a badge for this course".
   - Click the button to trigger the custom **Orchestrator** and **Actuators**.

Setting Up Development Environment
===================================

To set up a development environment for both the backend and the UI components:

**1. Micro-Frontend (MFE) Registration**

You must manually register the badges UI package in your MFE configuration:

* In your ``module.config.js``, add the entry for ``openedx-ai-badges``.

.. code-block:: javascript

   const path = require('path');

   module.exports = {
   localModules: [
      {
         moduleName: '@openedx/openedx-ai-extensions-ui',
         dir: path.resolve(__dirname, '../openedx-ai-extensions/frontend'),
         dist: 'src',
      },
      {
         moduleName: '@openedx/openedx-ai-badges-ui',
         dir: path.resolve(__dirname, '../openedx-ai-badges/frontend'),
         dist: 'src',
      },
   ],
   };

* In your ``env.config.jsx``, add the following import:

.. code-block:: javascript

    import '@openedx/openedx-ai-badges-ui';

**2. Backend Development**

Install the package in editable mode within your tutor environment:

.. code-block:: bash

    pip install -e /path/to/openedx-ai-badges/backend

**3. Advanced Setup**

For a detailed guide on developing extensions and handling cross-package dependencies, refer to the `Developer Guide for AI Extensions <https://github.com/openedx/openedx-ai-extensions/pull/83>`_.


Code Standards
==============

- All code, comments, and documentation must be in clear, concise English
- Write descriptive commit messages using conventional commits.
- Follow the CI instructions on code quality.


Architecture Decisions
======================

Significant architectural decisions are documented in ADRs (Architectural Decision Records) located in the ``docs/decisions/`` directory.

Contributing
************

We welcome contributions! This is an experimental project exploring AI integration patterns for Open edX.

**How to Contribute:**

1. Fork the repository
2. Create a feature branch (``git checkout -b feature/your-feature``)
3. Make your changes following the code standards
4. Write or update tests as needed
5. Submit a pull request with a clear description

For questions or discussions, please use the `Open edX discussion forum <https://discuss.openedx.org>`_.


References
**********

- `Open edX Plugin Development <https://docs.openedx.org/en/latest/developers/references/plugin_reference.html>`_

License
*******

This project is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0). See the LICENSE file for details.

Maintainer
**********

This repository is covered by the Open edX maintainers program and the current maintainers are listed in the `catalog-info.yaml <catalog-info.yaml>`_ file.

**Community Support:**

- Open edX Forum: https://discuss.openedx.org
- `GitHub Issues <https://github.com/edunext/openedx-ai-badges/issues>`_

**Note:** As this is an experimental project, support is provided on a best-effort basis.
