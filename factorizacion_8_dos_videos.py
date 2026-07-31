from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Iterable, Sequence

from manim import *


# ============================================================
# RENDER CONFIGURATION — Manim Community Edition 0.20.1
# ============================================================
config.background_color = WHITE
config.pixel_width = 1920
config.pixel_height = 1080
config.frame_width = 16
config.frame_height = 9
config.frame_rate = 30


# ============================================================
# PROJECT CONTROLS
# ============================================================
JR_FAST_MODE = os.getenv("JR_FAST_MODE", "0") == "1"
JR_REAL_TIMER = os.getenv("JR_REAL_TIMER", "0") == "1"


# ============================================================
# VISUAL SYSTEM
# ============================================================
INK = "#172033"
MUTED = "#667085"
LINE = "#D9E2EF"
SURFACE = "#F7F9FC"
BLUE = "#1F5FBF"
BLUE_D = "#174A94"
BLUE_SOFT = "#EAF2FF"
ORANGE = "#E88B2B"
ORANGE_SOFT = "#FFF1E2"
GREEN = "#18794E"
GREEN_SOFT = "#E9F7F0"
RED = "#B42318"
RED_SOFT = "#FDECEC"
PURPLE = "#6941C6"
PURPLE_SOFT = "#F1ECFF"
GOLD = "#A15C00"


@dataclass(frozen=True)
class Exercise:
    number: int
    expression: str
    family: str
    cue: str
    first_move: str


EXERCISES: tuple[Exercise, ...] = (
    Exercise(
        1,
        r"18a^4b^3-30a^3b^4+12a^2b^2",
        "Factor común monomio",
        "Tres términos: todos comparten número, a y b.",
        "Calcula el MCD y toma los exponentes menores.",
    ),
    Exercise(
        2,
        r"9(2x-1)-4(2x-1)-3y(2x-1)",
        "Factor común polinomio",
        "El paréntesis completo (2x−1) se repite.",
        "Trata el binomio repetido como una sola unidad.",
    ),
    Exercise(
        3,
        r"6ax+9ay-4bx-6by",
        "Agrupación",
        "Cuatro términos: dos pares producen el mismo binomio.",
        "Agrupa conservando los signos.",
    ),
    Exercise(
        4,
        r"\frac{49}{121}m^6n^{10}-\frac{16}{81}p^8q^2",
        "Diferencia de cuadrados",
        "Dos términos, resta y ambos son cuadrados perfectos.",
        "Extrae la raíz de cada coeficiente y divide exponentes entre 2.",
    ),
    Exercise(
        5,
        r"64x^9-125y^6",
        "Diferencia de cubos",
        "Dos términos, resta y ambos son cubos perfectos.",
        "Escribe A³−B³ antes de aplicar la identidad.",
    ),
    Exercise(
        6,
        r"12x^2-11x-5",
        "Trinomio ax²+bx+c",
        "Tres términos y coeficiente principal distinto de 1.",
        "Busca dos números cuyo producto sea ac y cuya suma sea b.",
    ),
    Exercise(
        7,
        r"6x^4-13x^2+6",
        "Forma cuadrática",
        "Las potencias 4, 2 y 0 forman un patrón cuadrático.",
        "Sustituye u=x² y factoriza el trinomio en u.",
    ),
    Exercise(
        8,
        r"27(a-b)^6+8(a+b)^3",
        "Suma de cubos compuestos",
        "Cada término es un cubo de una expresión completa.",
        "Define A=3(a−b)² y B=2(a+b).",
    ),
)


WORKSHOP_CLASSIFICATION = (
    ("Factor común monomio", "6, 17, 21", 3, BLUE),
    ("Factor común polinomio", "3, 11", 2, PURPLE),
    ("Agrupación", "4, 13, 18, 20, 23", 5, ORANGE),
    ("Diferencia de cuadrados", "5, 7, 10, 15", 4, GREEN),
    ("Suma o diferencia de cubos", "2, 9, 16, 19, 22, 25", 6, RED),
    ("Trinomio ax²+bx+c", "1, 8", 2, GOLD),
    ("Forma cuadrática", "12, 14, 24", 3, BLUE_D),
)


CASE_CARDS = (
    (
        "1 · Factor común monomio",
        "¿Qué número y qué letras aparecen en todos los términos?",
        r"\mathrm{MCD}+\text{menor exponente comun}",
        r"12x^3-18x^2=6x^2(2x-3)",
        "No saques el exponente mayor.",
        BLUE,
    ),
    (
        "2 · Factor común polinomio",
        "¿Qué paréntesis completo se repite?",
        r"P\,A+P\,B=P(A+B)",
        r"5(x+2)-3(x+2)=2(x+2)",
        "El binomio completo es una unidad.",
        PURPLE,
    ),
    (
        "3 · Agrupación",
        "¿Puedo formar dos grupos con el mismo factor?",
        r"a(x+y)+b(x+y)=(a+b)(x+y)",
        r"ax+ay+bx+by=(a+b)(x+y)",
        "Conserva cada signo al agrupar.",
        ORANGE,
    ),
    (
        "4 · Diferencia de cuadrados",
        "¿Hay dos cuadrados perfectos separados por resta?",
        r"A^2-B^2=(A-B)(A+B)",
        r"25a^4-36b^6=(5a^2-6b^3)(5a^2+6b^3)",
        "Una suma de cuadrados no usa esta identidad.",
        GREEN,
    ),
    (
        "5 · Suma y diferencia de cubos",
        "¿Cada término posee raíz cúbica exacta?",
        r"A^3\pm B^3=(A\pm B)(A^2\mp AB+B^2)",
        r"8a^6+125b^3=(2a^2+5b)(4a^4-10a^2b+25b^2)",
        "El último término del segundo factor es positivo.",
        RED,
    ),
    (
        "6 · Trinomio ax²+bx+c",
        "¿Qué pareja multiplica ac y suma b?",
        r"ax^2+bx+c\rightarrow ax^2+mx+nx+c",
        r"2x^2+7x+3=(2x+1)(x+3)",
        "Verifica producto y suma, no solo la suma.",
        GOLD,
    ),
    (
        "7 · Forma cuadrática",
        "¿Las potencias permiten una sustitución?",
        r"u=x^2\quad\Rightarrow\quad x^4-5x^2+4=u^2-5u+4",
        r"x^4-5x^2+4=(x-1)(x+1)(x-2)(x+2)",
        "Después de factorizar, regresa a x.",
        BLUE_D,
    ),
)


class FactorizacionVisualBase(MovingCameraScene):
    """Shared visual and pedagogical utilities for both videos."""

    def setup(self):
        super().setup()
        self.camera.background_color = WHITE
        self._footer: Mobject | None = None

    def hold(self, seconds: float = 1.0) -> None:
        if JR_FAST_MODE:
            self.wait(max(0.08, seconds * 0.10))
        else:
            self.wait(seconds)

    def txt(self, value: str, size: float = 34, color: str = INK, weight: str = NORMAL) -> Text:
        return Text(value, font_size=size, color=color, weight=weight)

    def mx(self, value: str, size: float = 46, color: str = INK) -> MathTex:
        return MathTex(value, color=color, font_size=size)

    @staticmethod
    def fit(mob: Mobject, max_width: float = 14.2, max_height: float | None = None) -> Mobject:
        if mob.width > max_width:
            mob.scale_to_fit_width(max_width)
        if max_height is not None and mob.height > max_height:
            mob.scale_to_fit_height(max_height)
        return mob

    def wrapped_text(self, text: str, size: float = 30, color: str = INK, max_width: float = 6.0, line_spacing: float = 0.88, weight: str = NORMAL) -> Paragraph:
        words = text.split()
        lines: list[str] = []
        current = ""
        approx_chars = max(18, int(max_width * 10.5 * (30 / size)))
        for word in words:
            candidate = f"{current} {word}".strip()
            if len(candidate) <= approx_chars:
                current = candidate
            else:
                if current:
                    lines.append(current)
                current = word
        if current:
            lines.append(current)
        return Paragraph(*lines, font_size=size, color=color, line_spacing=line_spacing, alignment="left", weight=weight)

    def footer(self, video_label: str) -> VGroup:
        rule = Line(LEFT * 7.4, RIGHT * 7.4, color=LINE, stroke_width=1.4)
        institution = self.txt("Instituto Jorge Robledo · Taller de Matemáticas 8.º · Docente: Juan Diego Pérez", size=22, color=MUTED)
        label = self.txt(video_label, size=21, color=BLUE_D, weight=SEMIBOLD)
        institution.to_edge(LEFT, buff=0.62)
        label.to_edge(RIGHT, buff=0.62)
        row = VGroup(institution, label)
        rule.next_to(row, UP, buff=0.12)
        group = VGroup(rule, row).to_edge(DOWN, buff=0.18)
        self.add(group)
        self._footer = group
        return group

    def section_title(self, title: str, subtitle: str | None = None, color: str = BLUE_D) -> VGroup:
        title_obj = self.txt(title, size=48, color=INK, weight=SEMIBOLD)
        accent = Line(LEFT * 1.25, RIGHT * 1.25, color=color, stroke_width=6)
        accent.next_to(title_obj, DOWN, buff=0.16).align_to(title_obj, LEFT)
        group = VGroup(title_obj, accent)
        if subtitle:
            sub = self.wrapped_text(subtitle, size=27, color=MUTED, max_width=12.5)
            sub.next_to(accent, DOWN, buff=0.18).align_to(title_obj, LEFT)
            group.add(sub)
        group.to_edge(UP, buff=0.34).to_edge(LEFT, buff=0.72)
        return group

    def badge(self, text: str, color: str = BLUE, size: float = 25) -> VGroup:
        label = self.txt(text, size=size, color=color, weight=SEMIBOLD)
        bg = RoundedRectangle(corner_radius=0.16, width=label.width + 0.46, height=label.height + 0.28, stroke_color=color, stroke_width=1.8, fill_color=WHITE, fill_opacity=1)
        return VGroup(bg, label)

    def panel(self, *content: Mobject, width: float = 6.6, height: float = 4.6, stroke: str = LINE, fill: str = WHITE, accent: str | None = None, padding: float = 0.30) -> VGroup:
        bg = RoundedRectangle(corner_radius=0.18, width=width, height=height, stroke_color=stroke, stroke_width=1.7, fill_color=fill, fill_opacity=1)
        group = VGroup(bg, *content)
        if accent:
            stripe = RoundedRectangle(corner_radius=0.04, width=0.08, height=height - 0.42, stroke_width=0, fill_color=accent, fill_opacity=1)
            stripe.move_to(bg.get_left() + RIGHT * 0.18)
            group.add(stripe)
        return group

    def prompt_card(self, heading: str, body: str, color: str = ORANGE, width: float = 5.4) -> VGroup:
        h = self.txt(heading, size=28, color=color, weight=SEMIBOLD)
        b = self.wrapped_text(body, size=27, color=INK, max_width=width - 0.8)
        content = VGroup(h, b).arrange(DOWN, aligned_edge=LEFT, buff=0.18)
        bg = RoundedRectangle(corner_radius=0.18, width=width, height=content.height + 0.60, stroke_color=color, stroke_width=1.8, fill_color=WHITE, fill_opacity=1)
        content.move_to(bg).align_to(bg, LEFT).shift(RIGHT * 0.35)
        return VGroup(bg, content)

    def pause_bar(self, label: str = "Pausa · piensa · registra") -> VGroup:
        icon = VGroup(RoundedRectangle(corner_radius=0.06, width=0.14, height=0.52, stroke_width=0, fill_color=ORANGE, fill_opacity=1), RoundedRectangle(corner_radius=0.06, width=0.14, height=0.52, stroke_width=0, fill_color=ORANGE, fill_opacity=1)).arrange(RIGHT, buff=0.10)
        text = self.txt(label, size=26, color=ORANGE, weight=SEMIBOLD)
        bar = Line(LEFT * 2.4, RIGHT * 2.4, color=ORANGE_SOFT, stroke_width=9)
        progress = Line(LEFT * 2.4, LEFT * 2.4, color=ORANGE, stroke_width=9)
        row = VGroup(icon, text).arrange(RIGHT, buff=0.22)
        group = VGroup(row, bar, progress).arrange(DOWN, buff=0.16)
        group.progress = progress
        group.bar = bar
        return group

    def animate_pause_bar(self, group: VGroup, seconds: float = 3.2) -> None:
        bar = group.bar
        progress = group.progress
        progress.become(Line(bar.get_left(), bar.get_left(), color=ORANGE, stroke_width=9))
        if JR_FAST_MODE:
            seconds = 0.25
        self.play(progress.animate.put_start_and_end_on(bar.get_left(), bar.get_right()), run_time=seconds, rate_func=linear)

    def fade_group(self, *mobs: Mobject, run_time: float = 0.65) -> None:
        targets = [m for m in mobs if m is not None]
        if targets:
            self.play(*[FadeOut(m) for m in targets], run_time=run_time)

    def reset_camera(self, run_time: float = 1.0) -> None:
        self.play(self.camera.frame.animate.move_to(ORIGIN).set(width=16), run_time=run_time, rate_func=smooth)

    def verify_card(self, expression: str, text: str = "Verificación estructural") -> VGroup:
        label = self.txt(text, size=25, color=GREEN, weight=SEMIBOLD)
        eq = self.mx(expression, size=35, color=GREEN)
        self.fit(eq, 6.3)
        content = VGroup(label, eq).arrange(DOWN, aligned_edge=LEFT, buff=0.18)
        bg = RoundedRectangle(corner_radius=0.18, width=max(6.7, content.width + 0.65), height=content.height + 0.55, stroke_color=GREEN, stroke_width=1.7, fill_color=GREEN_SOFT, fill_opacity=0.55)
        content.move_to(bg).align_to(bg, LEFT).shift(RIGHT * 0.32)
        return VGroup(bg, content)

    def common_checklist(self, item1: str, item2: str, item3: str) -> VGroup:
        rows = VGroup()
        for text in (item1, item2, item3):
            dot = Circle(radius=0.09, stroke_color=ORANGE, stroke_width=2.2)
            label = self.wrapped_text(text, size=27, color=INK, max_width=5.3)
            row = VGroup(dot, label).arrange(RIGHT, buff=0.18, aligned_edge=UP)
            rows.add(row)
        rows.arrange(DOWN, aligned_edge=LEFT, buff=0.30)
        return rows

    def show_step_stack(self, steps: Sequence[tuple[str, str]], center: np.ndarray = ORIGIN, max_width: float = 8.7, equation_size: float = 40, wait_after: float = 0.75) -> VGroup:
        visible = VGroup()
        top_y = 2.35
        for index, (caption, tex) in enumerate(steps, start=1):
            badge = self.badge(f"Paso {index}", color=BLUE_D, size=22)
            caption_obj = self.txt(caption, size=26, color=MUTED)
            eq = self.mx(tex, size=equation_size, color=INK)
            self.fit(eq, max_width)
            row = VGroup(badge, caption_obj).arrange(RIGHT, buff=0.18)
            block = VGroup(row, eq).arrange(DOWN, aligned_edge=LEFT, buff=0.16)
            block.move_to(center + UP * (top_y - index * 1.25)).align_to(center + LEFT * max_width / 2, LEFT)
            if len(visible) >= 3:
                old = visible[0]
                self.play(FadeOut(old, shift=UP * 0.15), run_time=0.35)
                visible.remove(old)
                self.play(visible.animate.shift(UP * 1.18), run_time=0.45)
                block.shift(UP * 1.18)
            self.play(FadeIn(row, shift=RIGHT * 0.10), Write(eq), run_time=0.90)
            visible.add(block)
            self.hold(wait_after)
        return visible


class Factorizacion8PresentacionEjercicios(FactorizacionVisualBase):
    def construct(self):
        self.footer("VIDEO 1 · Presentación y pretest")
        self.intro()
        self.learning_route()
        self.decision_map()
        self.workshop_radiography()
        self.recognition_cases()
        self.exercise_presentation()
        self.pretest_grid()
        self.closing()

    def intro(self):
        title = self.txt("Factorización: reconocer, decidir y resolver", size=59, color=INK, weight=SEMIBOLD)
        subtitle = self.txt("Presentación detallada de ejercicios · Grado 8.º", size=33, color=MUTED)
        question = self.txt("Antes de calcular: ¿qué patrón estoy viendo?", size=39, color=BLUE_D, weight=SEMIBOLD)
        tokens = VGroup()
        for label, color in [("FC", BLUE), ("FP", PURPLE), ("AGR", ORANGE), ("D²", GREEN), ("C³", RED), ("TRI", GOLD), ("SUST", BLUE_D)]:
            tokens.add(self.badge(label, color=color, size=25))
        tokens.arrange(RIGHT, buff=0.25)
        factor = self.txt("FACTOR", size=76, color=BLUE_D, weight=BOLD)
        VGroup(title, subtitle).arrange(DOWN, buff=0.22).move_to(UP * 1.65)
        tokens.move_to(DOWN * 0.05)
        factor.move_to(DOWN * 0.05)
        question.move_to(DOWN * 1.50)
        self.play(FadeIn(title, shift=DOWN * 0.18), run_time=1.0)
        self.play(FadeIn(subtitle), run_time=0.65)
        self.play(LaggedStart(*[FadeIn(token, shift=UP * 0.15) for token in tokens], lag_ratio=0.10), run_time=1.3)
        self.hold(0.8)
        self.play(ReplacementTransform(tokens, factor), run_time=1.4)
        self.play(FadeIn(question, shift=UP * 0.12), run_time=0.75)
        self.hold(2.2)
        self.fade_group(title, subtitle, factor, question)

    def learning_route(self):
        header = self.section_title("Dos momentos de trabajo", "Este primer video prepara la decisión. El segundo desarrolla cada solución paso a paso.", color=BLUE)
        left_title = self.txt("1 · Reconocer", size=37, color=BLUE_D, weight=SEMIBOLD)
        left_body = self.common_checklist("Contar términos y observar signos.", "Buscar factores o paréntesis repetidos.", "Identificar cuadrados, cubos o patrón cuadrático.")
        left_content = VGroup(left_title, left_body).arrange(DOWN, aligned_edge=LEFT, buff=0.34)
        left_panel = self.panel(left_content, width=6.7, height=4.0, stroke=BLUE, fill=BLUE_SOFT, accent=BLUE)
        left_content.move_to(left_panel[0]).shift(RIGHT * 0.18)
        right_title = self.txt("2 · Resolver", size=37, color=GREEN, weight=SEMIBOLD)
        right_body = self.common_checklist("Aplicar una estrategia estable.", "Factorizar completamente.", "Verificar reconstruyendo la expresión.")
        right_content = VGroup(right_title, right_body).arrange(DOWN, aligned_edge=LEFT, buff=0.34)
        right_panel = self.panel(right_content, width=6.7, height=4.0, stroke=GREEN, fill=GREEN_SOFT, accent=GREEN)
        right_content.move_to(right_panel[0]).shift(RIGHT * 0.18)
        panels = VGroup(left_panel, right_panel).arrange(RIGHT, buff=0.55).move_to(DOWN * 0.35)
        self.play(FadeIn(header), run_time=0.65)
        self.play(FadeIn(left_panel, shift=RIGHT * 0.15), run_time=0.8)
        self.play(FadeIn(right_panel, shift=LEFT * 0.15), run_time=0.8)
        self.hold(2.3)
        self.fade_group(header, panels)

    def decision_map(self):
        header = self.section_title("Mapa de decisiones", "No memorices el número del ejercicio: sigue preguntas de reconocimiento.", color=ORANGE)
        questions = [("1", "¿Todos los términos comparten algo?", "Factor común"), ("2", "¿Se repite un paréntesis completo?", "Factor polinomio"), ("3", "¿Puedo crear dos grupos iguales?", "Agrupación"), ("4", "¿Hay exactamente dos términos?", "Cuadrados o cubos"), ("5", "¿Es resta de cuadrados perfectos?", "Diferencia de cuadrados"), ("6", "¿Son cubos perfectos?", "Suma / diferencia de cubos"), ("7", "¿Es un trinomio ax²+bx+c?", "Descomponer término central"), ("8", "¿Las potencias admiten sustitución?", "Forma cuadrática")]
        cards = VGroup()
        for number, question, outcome in questions:
            n = self.badge(number, color=ORANGE, size=22)
            q = self.wrapped_text(question, size=26, color=INK, max_width=4.8, weight=SEMIBOLD)
            outcome_obj = self.txt(outcome, size=23, color=BLUE_D)
            content = VGroup(VGroup(n, q).arrange(RIGHT, buff=0.20, aligned_edge=UP), outcome_obj).arrange(DOWN, aligned_edge=LEFT, buff=0.18)
            bg = RoundedRectangle(corner_radius=0.16, width=6.7, height=1.16, stroke_color=LINE, stroke_width=1.4, fill_color=WHITE, fill_opacity=1)
            content.move_to(bg).align_to(bg, LEFT).shift(RIGHT * 0.26)
            cards.add(VGroup(bg, content))
        left = VGroup(*cards[:4]).arrange(DOWN, buff=0.16)
        right = VGroup(*cards[4:]).arrange(DOWN, buff=0.16)
        board = VGroup(left, right).arrange(RIGHT, buff=0.45).move_to(DOWN * 0.28)
        self.play(FadeIn(header), run_time=0.6)
        for pair in zip(left, right):
            self.play(FadeIn(pair[0], shift=RIGHT * 0.10), FadeIn(pair[1], shift=LEFT * 0.10), run_time=0.65)
            self.hold(0.45)
        self.hold(2.1)
        self.fade_group(header, board)

    def workshop_radiography(self):
        header = self.section_title("Radiografía del taller original", "Los 25 ejercicios están mezclados. La primera habilidad evaluada es reconocer el caso.", color=PURPLE)
        rows = VGroup()
        for family, numbers, count, color in WORKSHOP_CLASSIFICATION:
            family_obj = self.txt(family, size=26, color=INK, weight=SEMIBOLD)
            numbers_obj = self.txt(numbers, size=25, color=MUTED)
            count_obj = self.badge(f"{count} ejercicios", color=color, size=21)
            bg = RoundedRectangle(corner_radius=0.12, width=13.8, height=0.64, stroke_color=LINE, stroke_width=1.1, fill_color=WHITE, fill_opacity=1)
            family_obj.move_to(bg.get_left() + RIGHT * 2.75)
            numbers_obj.move_to(bg.get_center() + RIGHT * 1.05)
            count_obj.move_to(bg.get_right() + LEFT * 1.45)
            rows.add(VGroup(bg, family_obj, numbers_obj, count_obj))
        rows.arrange(DOWN, buff=0.10).move_to(DOWN * 0.35)
        summary = self.txt("Mayor presencia: cubos (6) · agrupación (5) · diferencia de cuadrados (4)", size=27, color=PURPLE, weight=SEMIBOLD)
        summary.next_to(rows, DOWN, buff=0.25)
        self.play(FadeIn(header), run_time=0.65)
        self.play(LaggedStart(*[FadeIn(row, shift=RIGHT * 0.08) for row in rows], lag_ratio=0.08), run_time=1.8)
        self.play(FadeIn(summary, shift=UP * 0.10), run_time=0.7)
        self.hold(2.4)
        self.fade_group(header, rows, summary)

    def recognition_cases(self):
        for name, question, identity, example, error, color in CASE_CARDS:
            header = self.section_title(name, question, color=color)
            cue_label = self.badge("SEÑAL DE RECONOCIMIENTO", color=ORANGE, size=21)
            cue_text = self.wrapped_text(question, size=31, color=INK, max_width=5.5, weight=SEMIBOLD)
            cue = VGroup(cue_label, cue_text).arrange(DOWN, aligned_edge=LEFT, buff=0.22)
            cue_panel = self.panel(cue, width=6.4, height=3.1, stroke=ORANGE, fill=ORANGE_SOFT, accent=ORANGE)
            cue.move_to(cue_panel[0]).shift(RIGHT * 0.18)
            rule_label = self.badge("REGLA", color=color, size=21)
            identity_eq = self.mx(identity, size=39, color=color)
            self.fit(identity_eq, 6.0)
            example_label = self.txt("Ejemplo de referencia", size=25, color=MUTED)
            example_eq = self.mx(example, size=36, color=INK)
            self.fit(example_eq, 6.0)
            rule_content = VGroup(rule_label, identity_eq, example_label, example_eq).arrange(DOWN, aligned_edge=LEFT, buff=0.22)
            rule_panel = self.panel(rule_content, width=7.2, height=3.65, stroke=color, fill=WHITE, accent=color)
            rule_content.move_to(rule_panel[0]).shift(RIGHT * 0.18)
            panels = VGroup(cue_panel, rule_panel).arrange(RIGHT, buff=0.45).move_to(DOWN * 0.18)
            error_card = self.prompt_card("Error frecuente", error, color=RED, width=12.2)
            error_card.next_to(panels, DOWN, buff=0.22)
            self.play(FadeIn(header), run_time=0.55)
            self.play(FadeIn(cue_panel, shift=RIGHT * 0.12), run_time=0.70)
            self.play(FadeIn(rule_panel, shift=LEFT * 0.12), run_time=0.75)
            self.play(Write(identity_eq), run_time=0.70)
            self.play(Circumscribe(example_eq, color=color, time_width=0.8), run_time=0.80)
            self.play(FadeIn(error_card, shift=UP * 0.08), run_time=0.55)
            self.hold(1.8)
            self.fade_group(header, panels, error_card, run_time=0.55)

    def exercise_presentation(self):
        intro_header = self.section_title("Pretest diagnóstico", "Pausa el video. Escribe primero el caso y después factoriza completamente.", color=ORANGE)
        instruction = self.prompt_card("En tu cuaderno", "Para cada ejercicio registra: 1) caso, 2) primera decisión, 3) factorización completa, 4) verificación.", color=ORANGE, width=12.8)
        instruction.move_to(DOWN * 0.20)
        self.play(FadeIn(intro_header), FadeIn(instruction), run_time=0.85)
        self.hold(2.5)
        self.fade_group(intro_header, instruction)
        for exercise in EXERCISES:
            header = self.section_title(f"Ejercicio {exercise.number} de 8", "La familia permanece oculta: usa el mapa de decisiones.", color=ORANGE)
            expr = self.mx(exercise.expression, size=54, color=INK)
            self.fit(expr, 12.8, 1.7)
            expr_bg = RoundedRectangle(corner_radius=0.22, width=13.5, height=max(1.65, expr.height + 0.70), stroke_color=BLUE, stroke_width=2.0, fill_color=BLUE_SOFT, fill_opacity=0.38)
            expr_group = VGroup(expr_bg, expr)
            expr.move_to(expr_bg)
            expr_group.move_to(UP * 1.10)
            checklist = self.common_checklist("Cuenta términos y observa el signo principal.", "Busca algo común o una estructura repetida.", "Comprueba si hay potencias perfectas o sustitución.")
            checklist_panel = self.panel(checklist, width=6.45, height=2.55, stroke=LINE, fill=WHITE, accent=ORANGE)
            checklist.move_to(checklist_panel[0]).shift(RIGHT * 0.18)
            response = self.prompt_card("Registra antes de operar", "Caso elegido · primera transformación · resultado final.", color=BLUE_D, width=6.45)
            lower = VGroup(checklist_panel, response).arrange(RIGHT, buff=0.45).move_to(DOWN * 1.48)
            pause = self.pause_bar()
            pause.scale(0.86).next_to(expr_group, DOWN, buff=0.30)
            self.play(FadeIn(header), run_time=0.50)
            self.play(FadeIn(expr_group, shift=UP * 0.12), run_time=0.75)
            self.play(FadeIn(lower, shift=UP * 0.10), run_time=0.70)
            self.play(FadeIn(pause), run_time=0.45)
            self.animate_pause_bar(pause, seconds=3.0 if exercise.number < 8 else 3.6)
            self.hold(0.55)
            self.fade_group(header, expr_group, lower, pause, run_time=0.50)

    def pretest_grid(self):
        header = self.section_title("Los ocho ejercicios en una sola vista", "Tiempo sugerido en clase: 30 minutos. No uses el solucionario mientras trabajas.", color=BLUE_D)
        cards = VGroup()
        for exercise in EXERCISES:
            num = self.badge(str(exercise.number), color=BLUE_D, size=20)
            expr = self.mx(exercise.expression, size=29, color=INK)
            self.fit(expr, 5.5, 0.75)
            line = VGroup(num, expr).arrange(RIGHT, buff=0.20)
            bg = RoundedRectangle(corner_radius=0.15, width=6.65, height=1.05, stroke_color=LINE, stroke_width=1.4, fill_color=WHITE, fill_opacity=1)
            line.move_to(bg).align_to(bg, LEFT).shift(RIGHT * 0.25)
            cards.add(VGroup(bg, line))
        left = VGroup(*cards[:4]).arrange(DOWN, buff=0.16)
        right = VGroup(*cards[4:]).arrange(DOWN, buff=0.16)
        grid = VGroup(left, right).arrange(RIGHT, buff=0.40).move_to(DOWN * 0.22)
        pause = self.pause_bar("Detén el video y comienza el pretest")
        pause.scale(0.86).next_to(grid, DOWN, buff=0.18)
        self.play(FadeIn(header), run_time=0.55)
        self.play(LaggedStart(*[FadeIn(card) for card in cards], lag_ratio=0.07), run_time=1.35)
        self.play(FadeIn(pause), run_time=0.45)
        self.animate_pause_bar(pause, seconds=4.0 if not JR_REAL_TIMER else 10.0)
        self.hold(1.5)
        self.fade_group(header, grid, pause)

    def closing(self):
        header = self.section_title("Antes del video de soluciones", color=GREEN)
        questions = VGroup(self.prompt_card("1", "¿Qué caso elegiste en cada ejercicio?", color=BLUE, width=4.2), self.prompt_card("2", "¿Cuál fue tu primera transformación?", color=ORANGE, width=4.2), self.prompt_card("3", "¿Cómo verificarás el resultado?", color=GREEN, width=4.2)).arrange(RIGHT, buff=0.35).move_to(UP * 0.20)
        closing = self.txt("Factorizar no es adivinar: es reconocer una estructura.", size=42, color=BLUE_D, weight=SEMIBOLD).move_to(DOWN * 2.05)
        self.play(FadeIn(header), run_time=0.55)
        self.play(LaggedStart(*[FadeIn(q, shift=UP * 0.10) for q in questions], lag_ratio=0.12), run_time=1.1)
        self.play(FadeIn(closing, shift=UP * 0.10), run_time=0.75)
        self.hold(3.5)


class Factorizacion8SolucionesPasoAPaso(FactorizacionVisualBase):
    def construct(self):
        self.footer("VIDEO 2 · Soluciones paso a paso")
        self.intro()
        self.solution_1_common_monomial()
        self.solution_2_common_polynomial()
        self.solution_3_grouping()
        self.solution_4_difference_squares()
        self.solution_5_difference_cubes()
        self.solution_6_general_trinomial()
        self.solution_7_quadratic_substitution()
        self.solution_8_composite_cubes()
        self.exam_strategy()
        self.closing()

    def intro(self):
        title = self.txt("Solucionario razonado", size=66, color=INK, weight=SEMIBOLD)
        subtitle = self.txt("Ocho ejercicios · decisiones explícitas · verificación", size=35, color=MUTED)
        rule = self.txt("En cada problema: reconocer → transformar → factorizar → verificar", size=35, color=GREEN, weight=SEMIBOLD)
        group = VGroup(title, subtitle, rule).arrange(DOWN, buff=0.34).move_to(UP * 0.20)
        self.play(FadeIn(title, shift=DOWN * 0.14), run_time=0.85)
        self.play(FadeIn(subtitle), run_time=0.55)
        self.play(FadeIn(rule, shift=UP * 0.12), run_time=0.70)
        self.hold(2.3)
        self.fade_group(group)

    def solution_shell(self, number: int, family: str, expression: str, color: str) -> tuple[VGroup, VGroup]:
        header = self.section_title(f"Ejercicio {number} · {family}", color=color)
        expr = self.mx(expression, size=50, color=INK)
        self.fit(expr, 12.8, 1.45)
        bg = RoundedRectangle(corner_radius=0.20, width=13.3, height=max(1.55, expr.height + 0.62), stroke_color=color, stroke_width=2.0, fill_color=WHITE, fill_opacity=1)
        expr.move_to(bg)
        group = VGroup(bg, expr).move_to(UP * 1.85)
        self.play(FadeIn(header), FadeIn(group, shift=UP * 0.10), run_time=0.75)
        return header, group

    def side_reason(self, heading: str, body: str, color: str = ORANGE) -> VGroup:
        card = self.prompt_card(heading, body, color=color, width=4.65)
        card.move_to(RIGHT * 4.85 + DOWN * 0.62)
        return card

    def main_solution_area(self) -> np.ndarray:
        return LEFT * 2.05 + DOWN * 0.45

    def finish_solution(self, header: VGroup, expression_group: VGroup, steps: VGroup, side: VGroup, verify: VGroup):
        self.play(FadeIn(verify, shift=UP * 0.10), run_time=0.65)
        self.hold(2.0)
        self.fade_group(header, expression_group, steps, side, verify, run_time=0.58)
        self.reset_camera(run_time=0.01 if JR_FAST_MODE else 0.55)

    def solution_1_common_monomial(self):
        header, expr_group = self.solution_shell(1, "Factor común monomio", EXERCISES[0].expression, BLUE)
        side = self.side_reason("Decisión", "Los tres términos comparten 6, a² y b². Los exponentes comunes se toman por el menor valor.", color=ORANGE)
        self.play(FadeIn(side, shift=LEFT * 0.10), run_time=0.65)
        steps = self.show_step_stack([("MCD de coeficientes", r"\mathrm{MCD}(18,30,12)=6"), ("Exponentes comunes", r"a^{\min(4,3,2)}b^{\min(3,4,2)}=a^2b^2"), ("Divide término a término", r"18a^4b^3\div6a^2b^2=3a^2b"), ("Segundo y tercer cociente", r"-30a^3b^4\div6a^2b^2=-5ab^2,\quad12a^2b^2\div6a^2b^2=2"), ("Factorización", r"\boxed{6a^2b^2(3a^2b-5ab^2+2)}")], center=self.main_solution_area(), max_width=8.5, equation_size=38)
        verify = self.verify_card(r"6a^2b^2(3a^2b-5ab^2+2)=18a^4b^3-30a^3b^4+12a^2b^2")
        verify.scale(0.86).move_to(DOWN * 2.82)
        self.finish_solution(header, expr_group, steps, side, verify)

    def solution_2_common_polynomial(self):
        header, expr_group = self.solution_shell(2, "Factor común polinomio", EXERCISES[1].expression, PURPLE)
        side = self.side_reason("Decisión", "El objeto repetido no es solo 2x ni solo −1: el factor es el binomio completo (2x−1).", color=ORANGE)
        self.play(FadeIn(side, shift=LEFT * 0.10), run_time=0.65)
        steps = self.show_step_stack([("Nombra el factor repetido", r"P=2x-1"), ("Reescribe la expresión", r"9P-4P-3yP"), ("Extrae P", r"P(9-4-3y)"), ("Simplifica dentro", r"P(5-3y)"), ("Regresa al binomio", r"\boxed{(2x-1)(5-3y)}")], center=self.main_solution_area(), max_width=8.3, equation_size=42)
        verify = self.verify_card(r"(2x-1)(5-3y)=9(2x-1)-4(2x-1)-3y(2x-1)")
        verify.scale(0.88).move_to(DOWN * 2.82)
        self.finish_solution(header, expr_group, steps, side, verify)

    def solution_3_grouping(self):
        header, expr_group = self.solution_shell(3, "Factorización por agrupación", EXERCISES[2].expression, ORANGE)
        side = self.side_reason("Decisión", "Agrupamos los términos con a y los términos con b. El signo negativo del segundo grupo debe conservarse.", color=ORANGE)
        self.play(FadeIn(side, shift=LEFT * 0.10), run_time=0.65)
        steps = self.show_step_stack([("Forma dos grupos", r"(6ax+9ay)+(-4bx-6by)"), ("Factor del primer grupo", r"3a(2x+3y)"), ("Factor del segundo grupo", r"-2b(2x+3y)"), ("Aparece el mismo binomio", r"3a(2x+3y)-2b(2x+3y)"), ("Extrae el binomio común", r"\boxed{(3a-2b)(2x+3y)}")], center=self.main_solution_area(), max_width=8.4, equation_size=41)
        verify = self.verify_card(r"(3a-2b)(2x+3y)=6ax+9ay-4bx-6by")
        verify.scale(0.90).move_to(DOWN * 2.82)
        self.finish_solution(header, expr_group, steps, side, verify)

    def solution_4_difference_squares(self):
        header, expr_group = self.solution_shell(4, "Diferencia de cuadrados", EXERCISES[3].expression, GREEN)
        side = self.side_reason("Decisión", "Hay dos términos y un signo menos. Cada coeficiente es una fracción cuadrada y todos los exponentes son pares.", color=ORANGE)
        self.play(FadeIn(side, shift=LEFT * 0.10), run_time=0.65)
        steps = self.show_step_stack([("Raíz del primer coeficiente", r"\sqrt{\frac{49}{121}}=\frac{7}{11}"), ("Raíz de las potencias", r"\sqrt{m^6n^{10}}=m^3n^5"), ("Raíz del segundo término", r"\sqrt{\frac{16}{81}p^8q^2}=\frac{4}{9}p^4q"), ("Define A y B", r"A=\frac{7}{11}m^3n^5,\qquad B=\frac{4}{9}p^4q"), ("Aplica A²−B²", r"\boxed{\left(\frac{7}{11}m^3n^5-\frac{4}{9}p^4q\right)\left(\frac{7}{11}m^3n^5+\frac{4}{9}p^4q\right)}")], center=self.main_solution_area(), max_width=8.7, equation_size=35)
        verify = self.verify_card(r"(A-B)(A+B)=A^2-B^2", "Verificación por identidad conjugada")
        verify.scale(0.96).move_to(DOWN * 2.82)
        self.finish_solution(header, expr_group, steps, side, verify)

    def solution_5_difference_cubes(self):
        header, expr_group = self.solution_shell(5, "Diferencia de cubos", EXERCISES[4].expression, RED)
        side = self.side_reason("Decisión", "64=4³, x⁹=(x³)³, 125=5³ y y⁶=(y²)³. Por tanto, la estructura es A³−B³.", color=ORANGE)
        self.play(FadeIn(side, shift=LEFT * 0.10), run_time=0.65)
        steps = self.show_step_stack([("Raíces cúbicas", r"\sqrt[3]{64x^9}=4x^3,\qquad\sqrt[3]{125y^6}=5y^2"), ("Define A y B", r"A=4x^3,\qquad B=5y^2"), ("Identidad", r"A^3-B^3=(A-B)(A^2+AB+B^2)"), ("Construye el segundo factor", r"A^2=16x^6,\quad AB=20x^3y^2,\quad B^2=25y^4"), ("Factorización", r"\boxed{(4x^3-5y^2)(16x^6+20x^3y^2+25y^4)}")], center=self.main_solution_area(), max_width=8.7, equation_size=36)
        verify = self.verify_card(r"(A-B)(A^2+AB+B^2)=A^3-B^3", "Verificación por identidad de cubos")
        verify.scale(0.95).move_to(DOWN * 2.82)
        self.finish_solution(header, expr_group, steps, side, verify)

    def solution_6_general_trinomial(self):
        header, expr_group = self.solution_shell(6, "Trinomio ax²+bx+c", EXERCISES[5].expression, GOLD)
        side = self.side_reason("Decisión", "Se necesita una pareja que multiplique ac=−60 y sume b=−11. La pareja correcta es −15 y 4.", color=ORANGE)
        self.play(FadeIn(side, shift=LEFT * 0.10), run_time=0.65)
        steps = self.show_step_stack([("Multiplica a por c", r"ac=12(-5)=-60"), ("Busca la pareja", r"-15+4=-11,\qquad(-15)(4)=-60"), ("Descompón el término central", r"12x^2-15x+4x-5"), ("Agrupa", r"3x(4x-5)+1(4x-5)"), ("Extrae el binomio", r"\boxed{(3x+1)(4x-5)}")], center=self.main_solution_area(), max_width=8.4, equation_size=42)
        verify = self.verify_card(r"(3x+1)(4x-5)=12x^2-15x+4x-5=12x^2-11x-5")
        verify.scale(0.90).move_to(DOWN * 2.82)
        self.finish_solution(header, expr_group, steps, side, verify)

    def solution_7_quadratic_substitution(self):
        header, expr_group = self.solution_shell(7, "Forma cuadrática por sustitución", EXERCISES[6].expression, BLUE_D)
        side = self.side_reason("Decisión", "x⁴=(x²)². La expresión se convierte en un trinomio cuadrático al usar u=x².", color=ORANGE)
        self.play(FadeIn(side, shift=LEFT * 0.10), run_time=0.65)
        steps = self.show_step_stack([("Sustituye", r"u=x^2\quad\Rightarrow\quad x^4=u^2"), ("Trinomio en u", r"6u^2-13u+6"), ("Producto y suma", r"ac=36,\qquad-9+(-4)=-13"), ("Factoriza en u", r"6u^2-9u-4u+6=(3u-2)(2u-3)"), ("Regresa a x", r"\boxed{(3x^2-2)(2x^2-3)}")], center=self.main_solution_area(), max_width=8.4, equation_size=39)
        verify = self.verify_card(r"(3x^2-2)(2x^2-3)=6x^4-9x^2-4x^2+6=6x^4-13x^2+6")
        verify.scale(0.88).move_to(DOWN * 2.82)
        self.finish_solution(header, expr_group, steps, side, verify)

    def solution_8_composite_cubes(self):
        header, expr_group = self.solution_shell(8, "Suma de cubos compuestos", EXERCISES[7].expression, RED)
        side = self.side_reason("Decisión", "La base cúbica puede ser una expresión completa. No expandas (a−b) ni (a+b): reconoce primero A³+B³.", color=ORANGE)
        self.play(FadeIn(side, shift=LEFT * 0.10), run_time=0.65)
        substitution = self.mx(r"A=3(a-b)^2,\qquad B=2(a+b)", size=44, color=RED)
        substitution.move_to(LEFT * 2.0 + DOWN * 0.10)
        self.play(Write(substitution), run_time=0.85)
        self.play(self.camera.frame.animate.move_to(substitution).set(width=10.5), run_time=1.05, rate_func=smooth)
        self.play(Circumscribe(substitution, color=ORANGE, time_width=0.9), run_time=0.90)
        self.hold(1.0)
        self.reset_camera(run_time=1.0)
        self.play(FadeOut(substitution), run_time=0.45)
        steps = self.show_step_stack([("Reconoce cada cubo", r"27(a-b)^6=[3(a-b)^2]^3,\quad8(a+b)^3=[2(a+b)]^3"), ("Identidad", r"A^3+B^3=(A+B)(A^2-AB+B^2)"), ("Primer factor", r"A+B=3(a-b)^2+2(a+b)"), ("Segundo factor", r"A^2-AB+B^2=9(a-b)^4-6(a-b)^2(a+b)+4(a+b)^2"), ("Factorización", r"\boxed{[3(a-b)^2+2(a+b)][9(a-b)^4-6(a-b)^2(a+b)+4(a+b)^2]}")], center=self.main_solution_area(), max_width=8.7, equation_size=33)
        verify = self.verify_card(r"(A+B)(A^2-AB+B^2)=A^3+B^3", "Verificación por identidad de suma de cubos")
        verify.scale(0.96).move_to(DOWN * 2.82)
        self.finish_solution(header, expr_group, steps, side, verify)

    def exam_strategy(self):
        header = self.section_title("Estrategia estable para el examen", "La decisión correcta evita operaciones innecesarias.", color=BLUE_D)
        actions = ["1 · Ordenar la expresión, si es necesario.", "2 · Buscar factor común antes de cualquier fórmula.", "3 · Contar términos y observar el signo.", "4 · Identificar cuadrados, cubos o patrón de sustitución.", "5 · Seleccionar una identidad o método.", "6 · Factorizar completamente.", "7 · Verificar multiplicando o usando la identidad."]
        rows = VGroup()
        for action, color in zip(actions, [BLUE, BLUE, ORANGE, ORANGE, PURPLE, GREEN, GREEN]):
            dot = Circle(radius=0.10, stroke_width=0, fill_color=color, fill_opacity=1)
            text = self.txt(action, size=29, color=INK)
            rows.add(VGroup(dot, text).arrange(RIGHT, buff=0.22))
        rows.arrange(DOWN, aligned_edge=LEFT, buff=0.30).move_to(DOWN * 0.18)
        warning = self.prompt_card("Regla central", "No empieces distribuyendo. Primero reconoce.", color=RED, width=6.4)
        warning.next_to(rows, RIGHT, buff=0.60)
        rows.shift(LEFT * 2.0)
        self.play(FadeIn(header), run_time=0.55)
        self.play(LaggedStart(*[FadeIn(row, shift=RIGHT * 0.08) for row in rows], lag_ratio=0.10), run_time=1.5)
        self.play(FadeIn(warning, shift=LEFT * 0.10), run_time=0.70)
        self.hold(2.8)
        self.fade_group(header, rows, warning)

    def closing(self):
        header = self.section_title("Cierre de la preparación", color=GREEN)
        questions = VGroup(self.prompt_card("Autoevaluación", "¿Qué caso reconoces con mayor facilidad?", color=BLUE, width=4.2), self.prompt_card("Práctica", "¿Qué caso debes repetir antes de la evaluación?", color=ORANGE, width=4.2), self.prompt_card("Argumentación", "¿Puedes explicar por qué elegiste la fórmula?", color=GREEN, width=4.2)).arrange(RIGHT, buff=0.34).move_to(UP * 0.25)
        closing = self.txt("Factorizar no es adivinar: es reconocer una estructura.", size=43, color=BLUE_D, weight=SEMIBOLD).move_to(DOWN * 2.05)
        self.play(FadeIn(header), run_time=0.55)
        self.play(LaggedStart(*[FadeIn(card, shift=UP * 0.10) for card in questions], lag_ratio=0.12), run_time=1.1)
        self.play(FadeIn(closing, shift=UP * 0.12), run_time=0.75)
        self.hold(3.8)


# Manual algebra verification table:
# (3x+1)(4x-5) = 12x^2 - 11x - 5
# (3x^2-2)(2x^2-3) = 6x^4 - 13x^2 + 6
# (3a-2b)(2x+3y) = 6ax + 9ay - 4bx - 6by
