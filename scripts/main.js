/* =========================================
   FARMACOVIGILANCIA | IPN
   JavaScript principal
========================================= */

document.addEventListener("DOMContentLoaded", () => {
  // =====================================
  // 1. ELEMENTOS DEL DOM
  // =====================================

  const header = document.querySelector(".header");
  const menuToggle = document.querySelector("#menu-toggle");
  const nav = document.querySelector("#nav");
  const navLinks = document.querySelectorAll(".nav__link");

  // =====================================
  // 2. MENÚ RESPONSIVE
  // =====================================

  const cerrarMenu = () => {
    if (!menuToggle || !nav) return;

    nav.classList.remove("nav--open");
    menuToggle.classList.remove("is-active");

    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Abrir menú de navegación");
  };

  const abrirMenu = () => {
    if (!menuToggle || !nav) return;

    nav.classList.add("nav--open");
    menuToggle.classList.add("is-active");

    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Cerrar menú de navegación");
  };

  if (menuToggle && nav) {
    menuToggle.addEventListener("click", () => {
      const estaAbierto = nav.classList.contains("nav--open");

      if (estaAbierto) {
        cerrarMenu();
      } else {
        abrirMenu();
      }
    });

    // Cerrar al seleccionar una sección
    navLinks.forEach((link) => {
      link.addEventListener("click", cerrarMenu);
    });

    // Cerrar al hacer clic fuera del menú
    document.addEventListener("click", (event) => {
      const estaAbierto = nav.classList.contains("nav--open");

      if (!estaAbierto) return;

      const clicEnMenu = nav.contains(event.target);
      const clicEnBoton = menuToggle.contains(event.target);

      if (!clicEnMenu && !clicEnBoton) {
        cerrarMenu();
      }
    });

    // Cerrar con la tecla Escape
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        cerrarMenu();
      }
    });

    // Cerrar cuando pasamos a escritorio
    const desktopQuery = window.matchMedia("(min-width: 961px)");

    desktopQuery.addEventListener("change", (event) => {
      if (event.matches) {
        cerrarMenu();
      }
    });
  }

  // =====================================
  // 3. HEADER AL HACER SCROLL
  // =====================================

  const actualizarHeader = () => {
    if (!header) return;

    header.classList.toggle("header--scrolled", window.scrollY > 30);
  };

  window.addEventListener("scroll", actualizarHeader, { passive: true });

  actualizarHeader();

  // =====================================
  // 4. NAVEGACIÓN ACTIVA
  // =====================================

  const actualizarEnlaceActivo = (id) => {
    navLinks.forEach((link) => {
      const activo = link.getAttribute("href") === `#${id}`;

      link.classList.toggle("nav__link--active", activo);

      if (activo) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  // Secciones vinculadas al menú principal
  const secciones = Array.from(navLinks)
    .map((link) => {
      const href = link.getAttribute("href");

      if (!href || !href.startsWith("#")) {
        return null;
      }

      return document.getElementById(href.substring(1));
    })
    .filter(Boolean);

  // Controlamos el desplazamiento programático
  // para evitar que el menú cambie antes de tiempo.
  let navegacionEnCurso = false;
  let temporizadorNavegacion;

  const detectarSeccionActual = () => {
    if (!secciones.length || navegacionEnCurso) return;

    const alturaHeader = header ? header.offsetHeight : 0;

    // Punto de referencia dentro del área visible.
    // Detecta la sección que ocupa la parte superior
    // del contenido, justo después del encabezado.
    const puntoReferencia = Math.min(
      alturaHeader + 35,
      window.innerHeight * 0.35,
    );

    let seccionActual = "inicio";

    secciones.forEach((seccion) => {
      const rect = seccion.getBoundingClientRect();

      if (rect.top <= puntoReferencia) {
        seccionActual = seccion.id;
      }
    });

    // Al llegar al final, respetar la última sección
    // disponible en el menú.
    actualizarEnlaceActivo(seccionActual);
  };

  let scrollPendiente = false;

  window.addEventListener(
    "scroll",
    () => {
      if (scrollPendiente) return;

      scrollPendiente = true;

      requestAnimationFrame(() => {
        detectarSeccionActual();
        scrollPendiente = false;
      });
    },
    { passive: true },
  );

  window.addEventListener("resize", detectarSeccionActual);

  detectarSeccionActual();

  // =====================================
  // 5. NAVEGACIÓN Y SCROLL SUAVE
  // =====================================

  const enlacesInternos = document.querySelectorAll('a[href^="#"]');

  const movimientoReducido = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  );

  const navegarASeccion = (id) => {
    const destino = document.getElementById(id);

    if (!destino) return;

    clearTimeout(temporizadorNavegacion);

    navegacionEnCurso = true;

    // Actualizamos el menú inmediatamente.
    actualizarEnlaceActivo(id);

    const comportamiento = movimientoReducido.matches ? "instant" : "smooth";

    if (id === "inicio") {
      // Regresar al inicio real del documento.
      window.scrollTo({
        top: 0,
        behavior: comportamiento,
      });
    } else {
      const alturaHeader = header ? header.offsetHeight : 0;

      const posicionDestino =
        destino.getBoundingClientRect().top + window.scrollY - alturaHeader;

      window.scrollTo({
        top: Math.max(0, posicionDestino),
        behavior: comportamiento,
      });
    }

    history.replaceState(null, "", `#${id}`);

    // Esperamos a que termine el desplazamiento suave
    // antes de reactivar la detección automática.
    temporizadorNavegacion = setTimeout(
      () => {
        navegacionEnCurso = false;
        detectarSeccionActual();
      },
      movimientoReducido.matches ? 50 : 1100,
    );
  };

  enlacesInternos.forEach((enlace) => {
    enlace.addEventListener("click", (event) => {
      const href = enlace.getAttribute("href");

      if (!href || href === "#") return;

      const id = href.substring(1);

      if (!document.getElementById(id)) return;

      event.preventDefault();

      navegarASeccion(id);

      cerrarMenu();
    });
  });

  // =====================================
  // 6. ANIMACIONES DE APARICIÓN
  // =====================================

  const elementosAnimados = document.querySelectorAll(
    ".hero__badge, " +
      ".hero__title, " +
      ".hero__subtitle, " +
      ".hero__description, " +
      ".hero__actions, " +
      ".hero__footer, " +
      ".hero__visual",
  );

  // No ocultamos contenido si el usuario
  // prefiere reducir las animaciones.
  if (!movimientoReducido.matches) {
    elementosAnimados.forEach((elemento, index) => {
      elemento.animate(
        [
          {
            opacity: 0,
            transform: "translateY(18px)",
          },
          {
            opacity: 1,
            transform: "translateY(0)",
          },
        ],
        {
          duration: 650,
          delay: index * 90,
          easing: "ease-out",
          fill: "both",
        },
      );
    });
  }

  // =====================================
  // ANIMACIONES DE HISTORIA AL SCROLL
  // =====================================

  const elementosHistoria = document.querySelectorAll(
    ".history__international, " +
      ".history__mexico-heading, " +
      ".timeline__item, " +
      ".history__closing, " +
      ".cofepris__overview, " +
      ".cofepris__legal, " +
      ".cofepris__areas, " +
      ".cofepris__resources",
  );

  if (
    elementosHistoria.length &&
    "IntersectionObserver" in window &&
    !movimientoReducido.matches
  ) {
    const observerHistoria = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("is-visible");

          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -30px 0px",
      },
    );

    elementosHistoria.forEach((elemento) => {
      elemento.classList.add("reveal-ready");
      observerHistoria.observe(elemento);
    });
  }

  // =====================================
  // GLOSARIO - ACORDEÓN
  // =====================================

  const glossaryItems = document.querySelectorAll(".glossary__item");

  glossaryItems.forEach((item) => {
    item.addEventListener("toggle", () => {
      if (!item.open) return;

      glossaryItems.forEach((otherItem) => {
        if (otherItem !== item) {
          otherItem.open = false;
        }
      });
    });
  });

  // =====================================
  // 7. INICIALIZACIÓN
  // =====================================

  console.info("Farmacovigilancia IPN | Sitio inicializado");
});
