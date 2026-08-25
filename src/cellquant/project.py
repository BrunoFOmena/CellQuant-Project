# Caminhos, Python/venv, npm e a porta 8000 — só biblioteca padrão
from __future__ import annotations

import json
import os
import shutil
import socket
import subprocess
import time
import urllib.error
import urllib.request
from pathlib import Path

HOST = "127.0.0.1"
PORT = 8000
APP_URL = f"http://{HOST}:{PORT}"
HEALTH_URL = f"{APP_URL}/health"


def repo_root() -> Path:
    env = os.environ.get("CELLQUANT_ROOT")
    if env:
        root = Path(env).resolve()
        if _is_root(root):
            return root
    here = Path.cwd().resolve()
    for candidate in [here, *here.parents]:
        if _is_root(candidate):
            return candidate
    raise SystemExit(
        "Pasta do CellQuant não encontrada. Entre na pasta do projeto e rode de novo."
    )


def _is_root(path: Path) -> bool:
    return (path / "backend" / "app" / "main.py").is_file() and (
        path / "frontend"
    ).is_dir()


def system_python() -> list[str]:
    if os.name == "nt":
        py = shutil.which("py")
        if py:
            return [py, "-3"]
    for name in ("python3", "python"):
        found = shutil.which(name)
        if found:
            return [found]
    raise SystemExit(
        "Python não encontrado. Instale Python 3 e marque 'Add python.exe to PATH'."
    )


def venv_python(root: Path) -> Path:
    if os.name == "nt":
        return root / "backend" / ".venv" / "Scripts" / "python.exe"
    return root / "backend" / ".venv" / "bin" / "python"


def venv_dir(root: Path) -> Path:
    return root / "backend" / ".venv"


def ensure_venv(root: Path) -> Path:
    py = venv_python(root)
    if not py.is_file():
        print("Criando ambiente virtual...")
        subprocess.run(
            [*system_python(), "-m", "venv", str(venv_dir(root))],
            check=True,
        )
    return py


def install_backend(root: Path, *, extra: list[str] | None = None) -> None:
    py = ensure_venv(root)
    reqs = [str(root / "backend" / "requirements.txt")]
    if extra:
        reqs.extend(extra)
    cmd = [str(py), "-m", "pip", "install", "-q"]
    for req in reqs:
        cmd.extend(["-r", req])
    print("Instalando dependências Python...")
    subprocess.run(cmd, check=True)


def npm_cmd() -> str | None:
    return shutil.which("npm.cmd") or shutil.which("npm")


def run_npm(root: Path, args: list[str], *, check: bool = True) -> int:
    npm = npm_cmd()
    if not npm:
        print("Node/npm não encontrado. A SPA precisa de um 'cellquant build' com Node.")
        if check:
            raise SystemExit(1)
        return 1
    completed = subprocess.run([npm, *args], cwd=root / "frontend", check=check)
    return completed.returncode


def ensure_spa(root: Path, *, force_build: bool = False) -> None:
    dist = root / "frontend" / "dist" / "index.html"
    if dist.is_file() and not force_build:
        return
    if not npm_cmd():
        if not dist.is_file():
            print(
                "Aviso: frontend/dist não existe e o Node/npm não está instalado.\n"
                "A API sobe, mas a tela só aparece depois de 'cellquant build'."
            )
        return
    print("Gerando a interface (npm run build)...")
    if not (root / "frontend" / "node_modules").is_dir():
        run_npm(root, ["ci"])
    else:
        run_npm(root, ["install"])
    run_npm(root, ["run", "build"])


def ensure_data_dir(root: Path) -> Path:
    data = root / "data"
    data.mkdir(parents=True, exist_ok=True)
    return data


def pids_listening(port: int, netstat_text: str) -> list[int]:
    pids: set[int] = set()
    needle = f":{port}"
    for raw in netstat_text.splitlines():
        line = raw.strip()
        if "LISTENING" not in line.upper() and "LISTEN" not in line:
            continue
        if needle not in line:
            continue
        parts = line.split()
        if not parts:
            continue
        try:
            pids.add(int(parts[-1]))
        except ValueError:
            continue
    return sorted(pids)


def listening_pids(port: int = PORT) -> list[int]:
    if os.name == "nt":
        completed = subprocess.run(
            ["netstat", "-ano", "-p", "tcp"],
            capture_output=True,
            text=True,
            errors="ignore",
            check=False,
        )
        return pids_listening(port, completed.stdout)
    lsof = shutil.which("lsof")
    if not lsof:
        return []
    completed = subprocess.run(
        [lsof, "-ti", f"tcp:{port}", f"-sTCP:LISTEN"],
        capture_output=True,
        text=True,
        errors="ignore",
        check=False,
    )
    pids: list[int] = []
    for line in completed.stdout.split():
        try:
            pids.append(int(line))
        except ValueError:
            continue
    return pids


def port_open(host: str = HOST, port: int = PORT) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.settimeout(0.4)
        return sock.connect_ex((host, port)) == 0


def health_json(timeout: float = 2.0) -> dict | None:
    try:
        with urllib.request.urlopen(HEALTH_URL, timeout=timeout) as response:
            return json.loads(response.read().decode("utf-8"))
    except (urllib.error.URLError, TimeoutError, ValueError, OSError):
        return None


def wait_health(seconds: float = 20.0) -> bool:
    deadline = time.time() + seconds
    while time.time() < deadline:
        if health_json() is not None:
            return True
        time.sleep(0.3)
    return False


def stop_pids(pids: list[int]) -> None:
    own = os.getpid()
    for pid in pids:
        if pid == own:
            continue
        if os.name == "nt":
            subprocess.run(
                ["taskkill", "/PID", str(pid), "/F"],
                capture_output=True,
                check=False,
            )
        else:
            try:
                os.kill(pid, 15)
            except OSError:
                pass
