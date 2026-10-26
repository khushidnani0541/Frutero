# Frutero

    ## Framework

    The framework & variation to be used:
    - **Framework**: react
    - **Variant**: nextjs
    - **Creation Method**: template

    ## Project Structure

    ```
    Frutero/
    ├── README.md                 # This file
    ├── frontend/                 # Application code
    ```

    **AI Studio Manager**
    *This project was created using AI Studio Manager - making development easier and faster.*
    
## Frutero demo platform

Demo of the Faclon platform for Frutero Ice Cream's Pottsville plant, on sample data: quality and cold chain,
production and OEE, pallet traceability with the ERP, downtime and maintenance, and CIP monitoring on spectral
sensors. The whole demo is one self-contained page, `frontend/public/demo.html`; the Next.js root page shows it
full-screen, so the site root is the demo. Every page carries the "Sample data, simulated plant" chip.

To change it, edit the pieces in `demo-src/` (style.css, sim.js, charts.js, ui.js, views1.js, views2.js, views3.js,
shell.html) and run `node demo-src/build.js /tmp/body.html frontend/public/demo.html`, which rebuilds the page from them.
