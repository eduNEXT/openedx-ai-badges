.. This is the Sphinx root document. It exists only to hold the toctree that
   Sphinx needs to build the navigation.

   Every other page in this directory is written so that it renders correctly
   in the GitHub web interface, which uses plain docutils: ``toctree``,
   ``:doc:`` and ``:ref:`` are Sphinx-only and show up there as error blocks,
   so pages cross-link each other with ordinary relative links to ``.rst``
   files instead. Keep this file as the single exception, and add new pages to
   the toctree below.

Documentation Contents
######################

.. toctree::
   :maxdepth: 2

   index
   readme
   getting_started
   quickstarts/index
   concepts/index
   how-tos/index
   how-tos/generate_badges_with_dcc_models
   testing
   internationalization
   openedx_ai_badges
   changelog
   decisions
   references/index
   references/mit_slm_orchestrator

.. toctree::
   :maxdepth: 1
   :glob:

   decisions/*


Indices and tables
##################

* :ref:`genindex`
* :ref:`modindex`
* :ref:`search`
