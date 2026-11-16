import java.lang.annotation.Annotation;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.net.URL;
import java.net.URLClassLoader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Stream;
import javax.tools.JavaCompiler;
import javax.tools.ToolProvider;

// A tiny test runner, so the exercises need nothing but a JDK (11 or newer).
// Run from this folder:  java RunTests.java
// It compiles src/ and tests/ into a temporary folder and runs every @Test method in TriageTest.
public class RunTests {

    public static void main(String[] args) throws Exception {
        List<String> javacArgs = new ArrayList<>();
        Path out = Files.createTempDirectory("triage-tests");
        javacArgs.add("-d");
        javacArgs.add(out.toString());
        for (String dir : List.of("src", "tests")) {
            try (Stream<Path> files = Files.walk(Path.of(dir))) {
                files.filter(p -> p.toString().endsWith(".java")).forEach(p -> javacArgs.add(p.toString()));
            }
        }

        JavaCompiler javac = ToolProvider.getSystemJavaCompiler();
        if (javac.run(null, null, null, javacArgs.toArray(new String[0])) != 0) {
            System.out.println("compile failed: no tests were run");
            System.exit(1);
        }

        int pass = 0;
        int fail = 0;
        int skipped = 0;
        try (URLClassLoader loader = new URLClassLoader(new URL[] { out.toUri().toURL() })) {
            Class<?> testClass = loader.loadClass("TriageTest");
            List<Method> methods = new ArrayList<>(List.of(testClass.getDeclaredMethods()));
            methods.sort(Comparator.comparing(Method::getName));
            for (Method method : methods) {
                String name = annotationValue(method, "Test");
                if (name == null) {
                    continue;
                }
                if (annotationValue(method, "Skip") != null) {
                    skipped++;
                    System.out.println("skip    - " + name);
                    continue;
                }
                try {
                    method.setAccessible(true);
                    method.invoke(testClass.getDeclaredConstructor().newInstance());
                    pass++;
                    System.out.println("ok      - " + name);
                } catch (InvocationTargetException e) {
                    fail++;
                    System.out.println("not ok  - " + name);
                    System.out.println("          " + e.getCause());
                }
            }
        } finally {
            try (Stream<Path> files = Files.walk(out)) {
                files.sorted(Comparator.reverseOrder()).forEach(p -> p.toFile().delete());
            }
        }

        System.out.println();
        System.out.println("tests " + (pass + fail + skipped));
        System.out.println("pass " + pass);
        System.out.println("fail " + fail);
        System.out.println("skipped " + skipped);
        System.exit(fail == 0 ? 0 : 1);
    }

    private static String annotationValue(Method method, String simpleName) throws Exception {
        for (Annotation annotation : method.getAnnotations()) {
            if (annotation.annotationType().getSimpleName().equals(simpleName)) {
                Method value = annotation.annotationType().getMethod("value");
                value.setAccessible(true); // the annotation types in TriageTest are package-private
                return (String) value.invoke(annotation);
            }
        }
        return null;
    }
}
